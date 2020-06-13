import ky from "ky";

export default ky.create({
  prefixUrl: "http://localhost:5500",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});
