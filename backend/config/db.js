import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect("mongodb+srv://root:123@fastfood.tebr7ko.mongodb.net/fastfood?retryWrites=true&w=majority&appName=FastFood")
    .then(() => console.log("DataBase Connected"));
};
