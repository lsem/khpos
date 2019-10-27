import IngredientsRow from "./ingredientsRow";
import HumanResourcesRow from "./humanResourcesRow";
import EquipmentRow from "./equipmentRow";

export default interface Step {
  id: string
  name: string
  ingredients: Array<IngredientsRow>
  humanResources?: Array<HumanResourcesRow>
  timeNorms?: Map<number, number>
  inventory: Array<EquipmentRow>
  instructions: string
}