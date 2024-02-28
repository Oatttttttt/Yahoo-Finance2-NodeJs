const express = require("express");
const yahooFinance = require("yahoo-finance2").default;
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const YAML = require("yaml");
const cors = require("cors");
const port = process.env.port || 3001;
const app = express();

app.use(cors());
app.use(express.json());
const file = fs.readFileSync("./swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(file);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const stockRouter = express.Router();
app.use("/stock", stockRouter);

stockRouter.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const quotesCount = 5;
    const result = await yahooFinance.search(query, { quotesCount });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve stock data. Please try again later.",
    });
  }
});

stockRouter.get("/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const quote = await yahooFinance.quote(symbol + ".BK");
    res.json(quote);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve stock data. Please try again later.",
    });
  }
});

stockRouter.get("/chart/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    let currentDate = new Date();
    let pastDate = new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000);

    const queryOptions = {
      period1: pastDate,
      period2: currentDate,
      interval: "1d",
    };
    const result = await yahooFinance.chart(symbol + ".BK", queryOptions);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve stock data. Please try again later.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});
