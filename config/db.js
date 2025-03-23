import mongoose from "mongoose";
import colors from "colors";
const connectDB = async () => {
    try {
        const url = process.env.MONGO_URL
        if (!url || url.trim() === "") {
            throw new Error("Null or empty mongodb url was given.")
        }
        const conn = await mongoose.connect(url);
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
};

export default connectDB;