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
import { TechMapAddRow } from "./TechMapAddRow";

export const stepTemplateRowsCount = 5;

type Props = {
  step: Step;
  units: number[];
  isTop: boolean;
  isBottom: boolean;
  ingredients: Ingredient[];
  inventory: Device[];
  increaseRowCount: Function;
  commitStep: Function;
};

type DataRow = IngredientsRow | HumanResourcesRow | EquipmentRow;

export const TechMapStep: React.FC<Props> = props => {
  const removeRow = (
    rowId: number,
    propName: "ingredients" | "humanResources" | "inventory"
  ) => {
    const oldStep = props.step;
    const newStep = {
      ...oldStep,
      [propName]: (oldStep[propName] as Array<DataRow>).filter(
        (r, i) => i !== rowId
      )
    };
    props.commitStep(newStep);
  };

  const addRow = (
    rowId: number,
    propName: "ingredients" | "humanResources" | "inventory"
  ) => {
    const oldStep = props.step;
    let newRow;

    switch (propName) {
      case "ingredients":
        newRow = {
          ingredientId: props.ingredients[0].id,
          countByUnits: new Map<number, number>()
        } as IngredientsRow;
        for (let i = 0; i < props.units.length; i++) {
          newRow.countByUnits.set(props.units[i], 1);
        }
        break;
      case "humanResources":
        newRow = {
          peopleCount: 1,
          timeNormsByUnits: new Map<number, number>()
        } as HumanResourcesRow;
        for (let i = 0; i < props.units.length; i++) {
          newRow.timeNormsByUnits.set(props.units[i], 1);
        }
        break;
      case "inventory":
        newRow = {
          deviceId: props.inventory[0].id,
          countByUnits: new Map<number, number>()
        } as EquipmentRow;
        for (let i = 0; i < props.units.length; i++) {
          newRow.countByUnits.set(props.units[i], 1);
        }
        break;
    }

    const newCollection = [...oldStep[propName]];
    newCollection.splice(rowId, 0, newRow as DataRow);

    const newStep = {
      ...oldStep,
      [propName]: newCollection
    };
    props.commitStep(newStep);
  };

  const editInstructions = (value: string) => {
    const newStep = { ...props.step, instructions: value };
    props.commitStep(newStep);
  };

  const step = props.step;

  const ingredientsRowsCount =
    step.ingredients.length > 0 ? step.ingredients.length : 1;
  const humanResourcesRowsCount =
    step.humanResources.length > 0 ? step.humanResources.length : 1;
  const inventoryRowsCount =
    step.inventory.length > 0 ? step.inventory.length : 1;

  const totalRowsCount =
    ingredientsRowsCount +
    humanResourcesRowsCount +
    inventoryRowsCount +
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

      <div
        className="techMapStepSideMenu"
        style={{
          gridColumn: 1,
          gridRowStart: increaseRowCount(0),
          gridRowEnd: increaseRowCount(0) + totalRowsCount
        }}
      >
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

      {!step.ingredients || step.ingredients.length === 0 ? (
        <TechMapAddRow
          row={increaseRowCount(1)}
          click={() => addRow(0, "ingredients")}
        />
      ) : (
        step.ingredients.map((i, indx) => (
          <TechMapIngredientsDataRow
            units={props.units}
            ingredientsRow={i}
            row={increaseRowCount(1)}
            ingredients={props.ingredients}
            key={indx}
            removeClick={() => removeRow(indx, "ingredients")}
            addClick={() => addRow(indx + 1, "ingredients")}
          />
        ))
      )}

      <TechMapStepSectionHeader
        name="Кількість людей"
        description="Нормативи по часу"
        icon={ICONS.PEOPLE}
        row={increaseRowCount(1)}
      />

      {!step.humanResources || step.humanResources.length === 0 ? (
        <TechMapAddRow
          row={increaseRowCount(1)}
          click={() => addRow(0, "humanResources")}
        />
      ) : (
        step.humanResources.map((h, indx) => (
          <TechMapHumanResourcesDataRow
            units={props.units}
            humanResourcesRow={h}
            row={increaseRowCount(1)}
            key={indx}
            removeClick={() => removeRow(indx, "humanResources")}
            addClick={() => addRow(indx + 1, "humanResources")}
          />
        ))
      )}

      <TechMapStepSectionHeader
        name="Обладнання"
        description="Одиниці обладнання"
        icon={ICONS.EQUIPMENT}
        row={increaseRowCount(1)}
      />

      {!step.inventory || step.inventory.length === 0 ? (
        <TechMapAddRow
          row={increaseRowCount(1)}
          click={() => addRow(0, "inventory")}
        />
      ) : (
        step.inventory.map((i, indx) => (
          <TechMapInventoryDataRow
            units={props.units}
            equipmentRow={i}
            row={increaseRowCount(1)}
            devices={props.inventory}
            key={indx}
            removeClick={() => removeRow(indx, "inventory")}
            addClick={() => addRow(indx + 1, "inventory")}
          />
        ))
      )}

      <div
        className="techMapStepInstructionsEditorWrapper"
        style={{
          gridColumn: "2 / -2",
          gridRow: increaseRowCount(1)
        }}
      >
        <TechMapStepInstructionsEditor
          instructions={step.instructions}
          editInstructions={editInstructions}
        />
      </div>
    </div>
  );
};
