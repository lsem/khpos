import IngredientsRow from "./ingredientsRow";
import HumanResourcesRow from "./humanResourcesRow";
import EquipmentRow from "./equipmentRow";

export default interface Step {
  id: string
  order: number
  name: string
  ingredients: Array<IngredientsRow>
  humanResources: Array<HumanResourcesRow>
  inventory: Array<EquipmentRow>
  instructions: string
}