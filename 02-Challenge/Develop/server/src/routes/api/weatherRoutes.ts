
import { Router, Request, Response } from "express";
const router = Router();
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";
router.post("/", (req: Request, res: Response) => {
  try {
    const cityName = req.body.cityName;
    WeatherService.getWeatherForCity(cityName).then((data) => {
      HistoryService.addCity(cityName);
      res.json(data);
    });
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/history", async (_req: Request, res: Response) => {
  HistoryService.getCities()
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});
router.delete("/history/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: "City ID is required." });
    return;
  }
  try {
    await HistoryService.removeCity(id);
    res
      .status(200)
      .json({ message: "City successfully removed from search history." });
    return;
  } catch (error: any) {
    console.error(`Error in DELETE /weather/history/${id}: ${error.message}`);
    res
      .status(500)
      .json({ error: "Failed to remove city from search history." });
    return;
  }
});
export default router;