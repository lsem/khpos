import TechMap from "../techMaps/techMap";
import Employee from "../employees/employee";

export default interface Job {
  id: string
  column: number
  startTime: Date
  techMap: TechMap
  quantity: number
  assigns?: Map<string, Array<Employee>>
}