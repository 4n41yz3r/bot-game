import "./styles.css";
import { mountGame } from "./ui/controls";

const app = document.querySelector<HTMLElement>("#app");

if (app) {
  mountGame(app);
}
