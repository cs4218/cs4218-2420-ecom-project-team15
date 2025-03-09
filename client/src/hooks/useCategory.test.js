import axios from "axios";
import useCategory from "./useCategory";
import { renderHook, waitFor } from "@testing-library/react";

jest.mock("axios", () => ({
  get: jest.fn()
}))

describe("AuthProvider", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  })

  it("should still return an empty array even if an error is thrown", async () => {
    axios.get.mockImplementation((route) => {
      throw new Error("An error has occured")
    });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(result.current).toEqual([]);
  })

  it("should return the categories", async () => {

    const mockResponse = { data: { category: [{ name: "Clothes", slug: "clothes" }] } }
    axios.get.mockReturnValueOnce(mockResponse);

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).not.toEqual([]);
    });

    expect(result.current).toEqual(mockResponse.data.category);
  })


})
