import classNames from 'classnames';
import Device from '../../models/inventory/device';
import HumanResourcesRow from '../../models/techMaps/humanResourcesRow';
import Icon from '../Icon';
import Ingredient from '../../models/ingredients/ingredient';
import React from 'react';
import Step from '../../models/techMaps/step';
import { ICONS } from '../../constants/icons';
import { TechMapAddRow } from './TechMapAddRow';
import { TechMapHumanResourcesDataRow } from './TechMapHumanResourcesDataRow';
import { TechMapIngredientsDataRow } from './TechMapIngredientsDataRow';
import { TechMapInventoryDataRow } from './TechMapInventoryDataRow';
import { TechMapStepInstructionsEditor } from './TechMapStepInstructionsEditor';
import { TechMapStepSectionHeader } from './TechMapStepSectionHeader';
import './TechMapStep.css';
import { TechMapTimeNormsDataRow } from './TechMapTimeNormsDataRow';

export const calcNeededRowsForStep = (step: Step) => {
  const stepTemplateRowsCount = 5;
  const ingredientsRowsCount =
    step.ingredients.length > 0 ? step.ingredients.length : 1;
  const humanResourcesRowsCount =
    step.humanResources && step.humanResources.length > 0
      ? step.humanResources.length
      : 1;
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

export const TechMapStep: React.FC<Props> = props => {
  const [state, setState] = React.useState({ isHeaderEditing: false });
  const step = props.step;
  const totalRows = calcNeededRowsForStep(step);

  let currentRow = 0;

  const increaseRowCount = (count: number) => {
    currentRow += count;
    return props.startRow + currentRow;
  };

  const removeIngredientsRow = (rowId: number) => {
    props.commitStep({
      ...step,
      ingredients: step.ingredients.filter((_, i) => i !== rowId)
    });
  };

  const removeInventoryRow = (rowId: number) => {
    props.commitStep({
      ...step,
      inventory: step.inventory.filter((_, i) => i !== rowId)
    });
  };

  const removeHumanResourcesRow = (rowId: number) => {
    const newHumanResources = (step.humanResources as HumanResourcesRow[]).filter(
      (_, i) => i !== rowId
    );
    props.commitStep({
      ...step,
      humanResources: newHumanResources.length ? newHumanResources : undefined
    });
  };

  const removeTimeNorms = () => {
    props.commitStep({
      ...step,
      timeNorms: undefined
    });
  };

  const addIngredientRow = (rowId: number) => {
    props.commitStep({
      ...step,
      ingredients: [
        ...step.ingredients,
        {
          ingredientId: props.ingredients[0].id,
          countByUnits: new Map<number, number>(props.units.map(u => [u, 1]))
        }
      ]
    });
  };

  const addInventoryRow = (rowId: number) => {
    props.commitStep({
      ...step,
      inventory: [
        ...step.inventory,
        {
          deviceId: props.inventory[0].id,
          countByUnits: new Map<number, number>(props.units.map(u => [u, 1]))
        }
      ]
    });
  };

  const addHumanResourcesRow = (rowId: number) => {
    props.commitStep({
      ...step,
      humanResources: [
        ...(step.humanResources ? step.humanResources : []),
        {
          peopleCount: 1,
          countByUnits: new Map<number, number>(props.units.map(u => [u, 1]))
        }
      ]
    });
  };

  const addTimeNormsRow = () => {
    props.commitStep({
      ...step,
      timeNorms: new Map<number, number>(props.units.map(u => [u, 1]))
    });
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

  const commitIngredientDataCell = (
    unit: number,
    rowId: number,
    value: number
  ) => {
    props.commitStep({
      ...step,
      ingredients: step.ingredients.map((i, indx) =>
        indx !== rowId
          ? i
          : {
              ...i,
              countByUnits: new Map(i.countByUnits).set(unit, value)
            }
      )
    });
  };

  const commitInventoryDataCell = (
    unit: number,
    rowId: number,
    value: number
  ) => {
    props.commitStep({
      ...step,
      inventory: step.inventory.map((i, indx) =>
        indx !== rowId
          ? i
          : {
              ...i,
              countByUnits: new Map(i.countByUnits).set(unit, value)
            }
      )
    });
  };

  const commitHumanResourcesDataCell = (
    unit: number,
    rowId: number,
    value: number
  ) => {
    props.commitStep({
      ...step,
      humanResources: (step.humanResources as HumanResourcesRow[]).map(
        (i, indx) =>
          indx !== rowId
            ? i
            : {
                ...i,
                countByUnits: new Map(i.countByUnits).set(unit, value)
              }
      )
    });
  };

  const commitTimeNormsDataCell = (
    unit: number,
    value: number
  ) => {
    props.commitStep({
      ...step,
      timeNorms: new Map(step.timeNorms as Map<number, number>).set(unit, value)
    });
  };

  const commitIngredientDropDown = (rowId: number, value: string) => {
    const oldRow = step.ingredients[rowId];
    const newRow = { ...oldRow, ingredientId: value };

    const newRows = step.ingredients.map((r, i) => (i === rowId ? newRow : r));
    const newStep = { ...step, ingredients: newRows } as Step;
    props.commitStep(newStep);
  };

  const commitPeopleCount = (rowId: number, value: number) => {
    const oldRow = (step.humanResources as HumanResourcesRow[])[rowId];
    const newRow = { ...oldRow, peopleCount: value };

    const newRows = (step.humanResources as HumanResourcesRow[]).map((r, i) =>
      i === rowId ? newRow : r
    );
    const newStep = { ...step, humanResources: newRows } as Step;
    props.commitStep(newStep);
  };

  const commitInventoryDropDown = (rowId: number, value: string) => {
    const oldRow = step.inventory[rowId];
    const newRow = { ...oldRow, deviceId: value };

    const newRows = step.inventory.map((r, i) => (i === rowId ? newRow : r));
    const newStep = { ...step, inventory: newRows } as Step;
    props.commitStep(newStep);
  };

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
        iconSize={16}
        row={increaseRowCount(1)}
      />

      {!step.ingredients || step.ingredients.length === 0 ? (
        <TechMapAddRow
          row={increaseRowCount(1)}
          click={() => addIngredientRow(0)}
        />
      ) : (
        step.ingredients.map((i, indx) => (
          <TechMapIngredientsDataRow
            units={props.units}
            ingredientsRow={i}
            row={increaseRowCount(1)}
            ingredients={props.ingredients}
            key={indx}
            removeClick={() => removeIngredientsRow(indx)}
            addClick={() => addIngredientRow(indx + 1)}
            updateCell={(unit, value) =>
              commitIngredientDataCell(unit, indx, value)
            }
            changeIngredient={i => commitIngredientDropDown(indx, i)}
          />
        ))
      )}

      <TechMapStepSectionHeader
        name={step.humanResources ? "Кількість людей" : "Нормативи по часу"}
        description={step.humanResources ? "Нормативи по часу" : ""}
        icon={step.humanResources ? ICONS.PEOPLE : ICONS.TIMER}
        iconSize={step.humanResources ? 16 : 12}
        row={increaseRowCount(1)}
      />

      {!step.humanResources && !step.timeNorms && 
        <div className="gridRowWrapper">
          <div className="techMapAddRow" style={{ gridRow: increaseRowCount(1), gridColumn: "2 / -2" }}>
  
            <button onClick={() => addHumanResourcesRow(0)}>
              <Icon size={16} color="#007aff" icon={ICONS.PEOPLE} />
              <span>&nbsp;</span>
              <span>Задати кількість людей</span>
            </button>

            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
  
            <button onClick={() => addTimeNormsRow()}>
              <Icon size={12} color="#007aff" icon={ICONS.TIMER} />
              <span>&nbsp;</span>
              <span>Задати час</span>
            </button>
          
          </div>
        </div>
      }

      {step.humanResources &&
        step.humanResources.map((h, indx) => (
          <TechMapHumanResourcesDataRow
            units={props.units}
            humanResourcesRow={h}
            row={increaseRowCount(1)}
            key={indx}
            removeClick={() => removeHumanResourcesRow(indx)}
            addClick={() => addHumanResourcesRow(indx + 1)}
            updateCell={(unit, value) =>
              commitHumanResourcesDataCell(unit, indx, value)
            }
            changePeopleCount={pc => commitPeopleCount(indx, pc)}
          />
        ))
      }

      {step.timeNorms &&
        <TechMapTimeNormsDataRow
          units={props.units}
          timeNorms={step.timeNorms}
          row={increaseRowCount(1)}
          removeClick={() => removeTimeNorms()}
          updateCell={(unit, value) =>
            commitTimeNormsDataCell(unit, value)
          }
        />
      }

      <TechMapStepSectionHeader
        name="Обладнання"
        description="Одиниці обладнання"
        icon={ICONS.EQUIPMENT}
        iconSize={16}
        row={increaseRowCount(1)}
      />

      {!step.inventory || step.inventory.length === 0 ? (
        <TechMapAddRow
          row={increaseRowCount(1)}
          click={() => addInventoryRow(0)}
        />
      ) : (
        step.inventory.map((i, indx) => (
          <TechMapInventoryDataRow
            units={props.units}
            equipmentRow={i}
            row={increaseRowCount(1)}
            devices={props.inventory}
            key={indx}
            removeClick={() => removeInventoryRow(indx)}
            addClick={() => addInventoryRow(indx + 1)}
            updateCell={(unit, value) =>
              commitInventoryDataCell(unit, indx, value)
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
