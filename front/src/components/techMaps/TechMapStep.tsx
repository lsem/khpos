import React from "react";
import classNames from "classnames";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";
import { TechMapIngredientsDataRow } from "./TechMapIngredientsDataRow";
import { TechMapStepSectionHeader } from "./TechMapStepSectionHeader";
import { TechMapHumanResourcesDataRow } from "./TechMapHumanResourcesDataRow";
import { TechMapInventoryDataRow } from "./TechMapInventoryDataRow";
import { TechMapStepInstructionsEditor } from "./TechMapStepInstructionsEditor";
import "./TechMapStep.css";
import Step from "../../models/techMaps/step";
import Ingredient from "../../models/ingredients/ingredient";
import Device from "../../models/inventory/device";
import IngredientsRow from "../../models/techMaps/ingredientsRow";
import HumanResourcesRow from "../../models/techMaps/humanResourcesRow";
import EquipmentRow from "../../models/techMaps/equipmentRow";

export const stepTemplateRowsCount = 5;

type Props = {
  step: Step
  units: number[]
  listId: number
  isTop: boolean
  isBottom: boolean
  ingredients: Ingredient[]
  inventory: Device[]
  increaseRowCount: Function
  commitStep: Function
}

type DataRow = IngredientsRow | HumanResourcesRow | EquipmentRow;

export const TechMapStep: React.FC<Props> = (props) => {

  const removeIngredientsRow = (row: DataRow) => {
    const oldStep = props.step;
    const newStep = {...oldStep, ingredients: oldStep.ingredients.filter(r => r != row)}
    props.commitStep(props.listId, newStep);
  }

  const removeHumanResourcesRow = (row: DataRow) => {
    const oldStep = props.step;
    const newStep = {...oldStep, humanResources: oldStep.humanResources.filter(r => r != row)}
    props.commitStep(props.listId, newStep);
  }

  const removeInventoryRow = (row: DataRow) => {
    const oldStep = props.step;
    const newStep = {...oldStep, inventory: oldStep.inventory.filter(r => r != row)}
    props.commitStep(props.listId, newStep);
  }

  const editInstructions = (value: string) => {
    const newStep = {...props.step, instructions: value}
    props.commitStep(props.listId, newStep);
  }

    const step = props.step;
    const totalRowsCount =
      step.ingredients.length +
      step.humanResources.length +
      step.inventory.length +
      stepTemplateRowsCount;
    const increaseRowCount = props.increaseRowCount;

    const stepFrameClasses = classNames("techMapStepFrame", {
      techMapStepFrameTop: props.isTop
    });

    return (
      <div className="techMapStep">
        <div
          className={stepFrameClasses}
          style={{
            gridColumn: "2 / -2",
            gridRowStart: increaseRowCount(1),
            gridRowEnd: totalRowsCount + increaseRowCount(0)
          }}
        >
          <section className="techMapStepHeaderBg" />
          <section className="techMapStepBodyBg" />
        </div>

        <header
          className="techMapStepHeader"
          style={{ gridColumn: "2 / -1", gridRow: increaseRowCount(0) }}
        >
          <h2>{step.name}</h2>
          <button>
            <Icon size={16} color="#333" icon={ICONS.EDIT} />
          </button>
        </header>

        <div className="techMapStepSideMenu" 
          style={{gridColumn: 1, gridRowStart: increaseRowCount(0), gridRowEnd: increaseRowCount(0) + totalRowsCount}}>
          <button className="techMapRoundButton2 rotate180">
            <Icon size={16} color="#007aff" icon={ICONS.UP} />
          </button>
          <button className="techMapRoundButton2">
            <Icon size={16} color="#007aff" icon={ICONS.DOWN} />
          </button>
          <button className="techMapRoundButton2">
            <Icon size={16} color="#007aff" icon={ICONS.DUPLICATE} />
          </button>
          <button className="techMapRoundButton2">
            <Icon size={16} color="#ff3b30" icon={ICONS.REMOVE} />
          </button>
        </div>

        <TechMapStepSectionHeader
          name="Інгредієнти"
          description="Кількість"
          icon={ICONS.INGREDIENTS}
          row={increaseRowCount(1)}
        />

        {step.ingredients.map((i, indx) => (
          <TechMapIngredientsDataRow
            units={props.units}
            ingredientsRow={i}
            row={increaseRowCount(1)}
            ingredients={props.ingredients}
            key={indx}
            removeRow={removeIngredientsRow}
          />
        ))}

        <TechMapStepSectionHeader
          name="Кількість людей"
          description="Нормативи по часу"
          icon={ICONS.PEOPLE}
          row={increaseRowCount(1)}
        />

        {step.humanResources.map((h, indx) => (
          <TechMapHumanResourcesDataRow
            units={props.units}
            humanResourcesRow={h}
            row={increaseRowCount(1)}
            key={indx}
            removeRow={removeHumanResourcesRow}
          />
        ))}

        <TechMapStepSectionHeader
          name="Обладнання"
          description="Одиниці обладнання"
          icon={ICONS.EQUIPMENT}
          row={increaseRowCount(1)}
        />

        {step.inventory.map((i, indx) => (
          <TechMapInventoryDataRow
            units={props.units}
            equipmentRow={i}
            row={increaseRowCount(1)}
            devices={props.inventory}
            key={indx}
            removeRow={removeInventoryRow}
          />
        ))}

        <div className="techMapStepInstructionsEditorWrapper" style={{
              gridColumn: "2 / -2",
              gridRow: increaseRowCount(1)
            }}>
          <TechMapStepInstructionsEditor 
            instructions={step.instructions} 
            editInstructions={editInstructions}/>
        </div>
        
        {!props.isBottom ?
          (<div 
            className="techMapStepSeparator"
            style={{ gridColumn: "2 / -2", gridRow: increaseRowCount(1) }}>
            <hr />
            <button className="techMapRoundButton1">
              <Icon size={16} color="#007aff" icon={ICONS.ADD} />
            </button>
            <hr />
          </div>) : 
          (<button 
            className="techMapAddStepButton"
            style={{ gridColumn: "2 / -2", gridRow: increaseRowCount(1) }}>
            <Icon size={16} color="#007aff" icon={ICONS.ADD} />
            <span>&nbsp;</span>
            <span>Додати крок</span>
          </button>)
        }
      </div>
    );
  }
