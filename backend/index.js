import express from "express";
import { mongoose } from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
//securty packges
import helmet from "helmet";
import errorMiddleware from "./middleware/errorMiddleware.js";
import router from "./routes/index.js";

const PORT = process.env.PORT || 8800;
const __dirname = path.resolve(path.dirname(""));
const app = express();

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URL, {});

  console.log("FINALLY, DB Connected Successfully");
} catch (error) {
  console.log("DB Error: " + error);
}

dotenv.config();

app.use(express.static(path.join(__dirname, "views/build")));
app.use("/files", express.static(path.join(__dirname, "public/files")));

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(router);

//error middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port: "${PORT}"`);
});