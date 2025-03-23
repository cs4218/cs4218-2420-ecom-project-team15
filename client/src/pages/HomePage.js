import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/Homepages.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0); // Total product count (no filters)
  const [filteredTotal, setFilteredTotal] = useState(0); // Track filtered total
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({}); // State for image loading

  // Function to handle image load events
  const handleImageLoad = (productId) => {
    setImagesLoaded((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  // Fetch categories
  const getAllCategory = async () => {
    try {
      const response = await axios.get("/api/v1/category/get-category");
      if (!response || !response.data) {
        console.warn("Invalid response: No data received");
        setCategories([]);
        return;
      }
  
      const { data } = response;
      if (!data.success || !Array.isArray(data.category)) {
        console.warn("No categories found or invalid data format");
        setCategories([]);
        return;
      }
  
      setCategories(data.category); 
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);

  //get products
const getAllProducts = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`/api/v1/product/product-list/${page}`);
    
    if (!response || !response.data) {
      console.warn("Invalid response: No data received");
      setProducts([]); 
      return;
    }

    const { data } = response;

    if (!Array.isArray(data.products)) {
      console.warn("Invalid product list received:", data.products);
      setProducts([]); 
      return;
    }

    setProducts(data.products); 
  } catch (error) {
    console.error("Error fetching products:", error);
    setProducts([]); 
  } finally {
    setLoading(false); 
  }
};


  //getTOtal COunt
  const getTotal = async () => {
    try {
      const response = await axios.get("/api/v1/product/product-count");
  
      if (!response || !response.data) {
        console.warn("Invalid response: No data received");
        setTotal(0);
        return;
      }
  
      const { data } = response;
  
      if (typeof data.total !== "number") {
        console.warn("Invalid product count received:", data.total);
        setTotal(0);
        return;
      }
  
      setTotal(data.total); 
    } catch (error) {
      console.error("Error fetching product count:", error);
      setTotal(0); 
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);
  //load more
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Filter by category
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  useEffect(() => {
    if (!checked.length && !radio.length) {
      getAllProducts(); 
      setFilteredTotal(total); 
    }
  }, [checked.length, radio.length]);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct(); // Apply filters
  }, [checked, radio]);

  // Filtered product fetching
  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(data?.products);
      setFilteredTotal(data?.total); 
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Layout title={"All Products - Best Offers "}>
      <img
        src="/images/Virtual.png"
        className="banner-img"
        alt="bannerimage"
        width={"100%"}
      />
      <div className="container-fluid row mt-3 home-page">
        <div className="col-md-3 filters">
          <h4 className="text-center">Filter By Category</h4>
          <div className="d-flex flex-column">
            {categories?.map((c) => (
              <Checkbox
                key={c._id}
                onChange={(e) => handleFilter(e.target.checked, c._id)}
              >
                {c.name}
              </Checkbox>
            ))}
          </div>
          <h4 className="text-center mt-4">Filter By Price</h4>
          <div className="d-flex flex-column">
            <Radio.Group onChange={(e) => setRadio(e.target.value)}>
              {Prices?.map((p) => (
                <div key={p._id}>
                  <Radio value={p.array}>{p.name}</Radio>
                </div>
              ))}
            </Radio.Group>
          </div>
          <div className="d-flex flex-column">
            <button
              className="btn btn-danger"
              onClick={() => window.location.reload()}
            >
              RESET FILTERS
            </button>
          </div>
        </div>
        <div className="col-md-9 ">
          <h1 className="text-center">All Products</h1>
          <div className="d-flex flex-wrap">
            {products?.map((p) => (
              <div className="card m-2" key={p._id}>
                {!imagesLoaded[p._id] && (
                  <div className="image-placeholder">Loading...</div>
                )}
                <img
                  src={`/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top"
                  alt={p.name}
                  onLoad={() => handleImageLoad(p._id)}
                  style={{ display: imagesLoaded[p._id] ? "block" : "none" }}
                />
                <div className="card-body">
                  <div className="card-name-price">
                    <h5 className="card-title">{p.name}</h5>
                    <h5 className="card-title card-price">
                      {p.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </h5>
                  </div>
                  <p className="card-text ">
                    {p.description.substring(0, 60)}...
                  </p>
                  <div className="card-name-price">
                    <button
                      className="btn btn-info ms-1"
                      onClick={() => navigate(`/product/${p.slug}`)}
                    >
                      More Details
                    </button>
                    <button
                      className="btn btn-dark ms-1"
                      onClick={() => {
                        setCart([...cart, p]);
                        localStorage.setItem(
                          "cart",
                          JSON.stringify([...cart, p])
                        );
                        toast.success("Item added to cart");
                      }}
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="m-2 p-3">
            {products && products.length < filteredTotal && ( // Show Load More based on filtered total
              <button
                className="btn loadmore"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                {loading ? (
                  "Loading ..."
                ) : (
                  <>
                    {" "}
                    Loadmore <AiOutlineReload />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
