import classNames from "classnames";
import Device from "../../models/inventory/device";
import EquipmentRow from "../../models/techMaps/equipmentRow";
import HumanResourcesRow from "../../models/techMaps/humanResourcesRow";
import Icon from "../Icon";
import Ingredient from "../../models/ingredients/ingredient";
import IngredientsRow from "../../models/techMaps/ingredientsRow";
import React from "react";
import Step from "../../models/techMaps/step";
import { ICONS } from "../../constants/icons";
import { TechMapAddRow } from "./TechMapAddRow";
import { TechMapHumanResourcesDataRow } from "./TechMapHumanResourcesDataRow";
import { TechMapIngredientsDataRow } from "./TechMapIngredientsDataRow";
import { TechMapInventoryDataRow } from "./TechMapInventoryDataRow";
import { TechMapStepInstructionsEditor } from "./TechMapStepInstructionsEditor";
import { TechMapStepSectionHeader } from "./TechMapStepSectionHeader";
import "./TechMapStep.css";

export const calcNeededRowsForStep = (step: Step) => {
  const stepTemplateRowsCount = 5;
  const ingredientsRowsCount =
    step.ingredients.length > 0 ? step.ingredients.length : 1;
  const humanResourcesRowsCount =
    step.humanResources.length > 0 ? step.humanResources.length : 1;
  const inventoryRowsCount =
    step.inventory.length > 0 ? step.inventory.length : 1;

  return (
    ingredientsRowsCount +
    humanResourcesRowsCount +
    inventoryRowsCount +
    stepTemplateRowsCount
  );
};

type Props = {
  step: Step;
  units: number[];
  isTop: boolean;
  isBottom: boolean;
  ingredients: Ingredient[];
  inventory: Device[];
  startRow: number;
  commitStep: (step: Step) => void;
  moveStepUp: () => void;
  moveStepDown: () => void;
  removeStep: () => void;
  duplicateStep: () => void;
};

type DataRow = IngredientsRow | HumanResourcesRow | EquipmentRow;

export const TechMapStep: React.FC<Props> = props => {
  const [state, setState] = React.useState({ isHeaderEditing: false });
  const step = props.step;
  const totalRows = calcNeededRowsForStep(step);

  let currentRow = 0;

  const increaseRowCount = (count: number) => {
    currentRow += count;
    return props.startRow + currentRow;
  };

  const removeRow = (
    rowId: number,
    propName: "ingredients" | "humanResources" | "inventory"
  ) => {
    const oldStep = step;
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
    const oldStep = step;
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
          countByUnits: new Map<number, number>()
        } as HumanResourcesRow;
        for (let i = 0; i < props.units.length; i++) {
          newRow.countByUnits.set(props.units[i], 1);
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
    const newStep = { ...step, instructions: value };
    props.commitStep(newStep);
  };

  const beginHeaderEditing = () => {
    setState({
      isHeaderEditing: true
    });
  };

  const endHeaderEditing = (newStepName: string) => {
    setState({
      isHeaderEditing: false
    });
    const newStep = { ...step, name: newStepName };
    props.commitStep(newStep);
  };

  const commitDataCellValue = (
    unit: number,
    rowId: number,
    value: number,
    propName: "ingredients" | "humanResources" | "inventory"
  ) => {
    const oldRow = step[propName][rowId];
    const newRow = {
      ...oldRow,
      countByUnits: new Map((oldRow as DataRow).countByUnits).set(unit, value)
    };

    const newRows = (step[propName] as DataRow[]).map((r, i) =>
      i === rowId ? newRow : r
    );
    const newStep = { ...step, [propName]: newRows } as Step;
    props.commitStep(newStep);
  };

  const commitIngredientDropDown = (rowId: number, value: string) => {
    const oldRow = step.ingredients[rowId];
    const newRow = { ...oldRow, ingredientId: value };

    const newRows = step.ingredients.map((r, i) =>
      i === rowId ? newRow : r
    );
    const newStep = { ...step, ingredients: newRows } as Step;
    props.commitStep(newStep);
  }

  const commitPeopleCount = (rowId: number, value: number) => {
    const oldRow = step.humanResources[rowId];
    const newRow = { ...oldRow, peopleCount: value };

    const newRows = step.humanResources.map((r, i) =>
      i === rowId ? newRow : r
    );
    const newStep = { ...step, humanResources: newRows } as Step;
    props.commitStep(newStep);
  }

  const commitInventoryDropDown = (rowId: number, value: string) => {
    const oldRow = step.inventory[rowId];
    const newRow = { ...oldRow, deviceId: value };

    const newRows = step.inventory.map((r, i) =>
      i === rowId ? newRow : r
    );
    const newStep = { ...step, inventory: newRows } as Step;
    props.commitStep(newStep);
  }

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
          gridRowEnd: totalRows + increaseRowCount(0)
        }}
      >
        <section className="techMapStepHeaderBg" />
        <section className="techMapStepBodyBg" />
      </div>

      <header
        className="techMapStepHeader"
        style={{ gridColumn: "2 / -1", gridRow: increaseRowCount(0) }}
      >
        {state.isHeaderEditing ? (
          <input
            type="text"
            autoFocus
            onBlur={e => endHeaderEditing(e.target.value)}
            defaultValue={step.name}
            onFocus={e => e.target.select()}
          />
        ) : (
          <h2>{step.name}</h2>
        )}

        <button onClick={() => beginHeaderEditing()}>
          <Icon size={16} color="#333" icon={ICONS.EDIT} />
        </button>
      </header>

      <div
        className="techMapStepSideMenu"
        style={{
          gridColumn: 1,
          gridRowStart: increaseRowCount(0),
          gridRowEnd: increaseRowCount(0) + totalRows
        }}
      >
        <button
          className="techMapRoundButton2 rotate180"
          onClick={() => props.moveStepUp()}
        >
          <Icon size={16} color="#007aff" icon={ICONS.UP} />
        </button>
        <button
          className="techMapRoundButton2"
          onClick={() => props.moveStepDown()}
        >
          <Icon size={16} color="#007aff" icon={ICONS.DOWN} />
        </button>
        <button
          className="techMapRoundButton2"
          onClick={() => props.duplicateStep()}
        >
          <Icon size={16} color="#007aff" icon={ICONS.DUPLICATE} />
        </button>
        <button
          className="techMapRoundButton2"
          onClick={() => props.removeStep()}
        >
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
            updateCell={(unit, value) =>
              commitDataCellValue(unit, indx, value, "ingredients")
            }
            changeIngredient={(i) => commitIngredientDropDown(indx, i)}
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
            updateCell={(unit, value) =>
              commitDataCellValue(unit, indx, value, "ingredients")
            }
            changePeopleCount={pc => commitPeopleCount(indx, pc)}
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
            updateCell={(unit, value) =>
              commitDataCellValue(unit, indx, value, "ingredients")
            }
            changeDevice={d => commitInventoryDropDown(indx, d)}
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
