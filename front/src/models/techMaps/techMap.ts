import Step from "./step";

export default interface TechMap {
  id: string
  version: number
  name: string
  units: Array<number>
  steps: Array<Step> 
}