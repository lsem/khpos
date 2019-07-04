import Step from "./step";

export default interface TechMap {
  id: string
  name: string
  units: Array<number>
  steps: Array<Step> 
}