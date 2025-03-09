import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Layout from "../components/Layout"; 
import "@testing-library/jest-dom/extend-expect";
import { HelmetProvider } from "react-helmet-async";


jest.mock("../components/Header", () => () => <header data-testid="mock-header">Header</header>);
jest.mock("../components/Footer", () => () => <footer data-testid="mock-footer">Footer</footer>);

describe("Layout Component", () => {
  it("renders and includes all key elements", () => {
    render(
      <HelmetProvider>
        <Layout> 
          <p>Test Content</p> 
        </Layout>
      </HelmetProvider>
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders default Helmet metadata correctly", async () => {
    render(
      <HelmetProvider> 
        <Layout />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(document.title).toBe("Ecommerce app - shop now");
    });

    await waitFor(() => {
      expect(
        document.querySelector('meta[name="description"]').getAttribute("content")
      ).toBe("mern stack project");
    });

    await waitFor(() => {
      expect(
        document.querySelector('meta[name="keywords"]').getAttribute("content")
      ).toBe("mern,react,node,mongodb");
    });
  });

  it("renders custom metadata when props are provided", async () => {
    render(
      <HelmetProvider>
        <Layout
          title="Custom Title"
          description="Custom description"
          keywords="custom,keywords,test"
          author="Test Author"
        />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(document.title).toBe("Custom Title");
    });

    await waitFor(() => {
      expect(
        document.querySelector('meta[name="description"]').getAttribute("content")
      ).toBe("Custom description");
    });

    await waitFor(() => {
      expect(
        document.querySelector('meta[name="keywords"]').getAttribute("content")
      ).toBe("custom,keywords,test");
    });

    await waitFor(() => {
      expect(
        document.querySelector('meta[name="author"]').getAttribute("content")
      ).toBe("Test Author");
    });
  });

  it("renders children correctly", () => {
    render(
      <HelmetProvider>
        <Layout>
          <div data-testid="child-element">Hello, World!</div>
        </Layout>
      </HelmetProvider>
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
  });
});
