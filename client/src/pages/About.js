import React from "react";
import Layout from "./../components/Layout";

const About = () => {
  return (
    <Layout title={"About us - Ecommerce app"}>
      <div className="row contactus ">
        <div className="col-md-6 ">
          <img src="/images/about.jpeg" alt="contactus" style={{ width: "100%" }} />
        </div>
        <div className="col-md-4">
          <p className="text-justify mt-2">
            Welcome to Virtual Vault, your ultimate destination for seamless and secure online
            shopping. Our mission is to revolutionize the e-commerce experience by offering a curated selection of
            high-quality products, ensuring affordability, convenience, and exceptional customer service. 

          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
