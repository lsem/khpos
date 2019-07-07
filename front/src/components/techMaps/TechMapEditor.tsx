import React from "react";
import { connect } from "react-redux";
import { thunkRequestTechMaps } from "../../store/techMaps/thunks";
import { thunkRequestIngredients } from "../../store/ingredients/thunks";
import { thunkRequestInventory } from "../../store/inventory/thunks";
import "./TechMapEditor.css";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";
import { TechMapStep } from "./TechMapStep";
import TechMap from "../../models/techMaps/techMap";
import Ingredient from "../../models/ingredients/ingredient";
import Device from "../../models/inventory/device";
import Step from "../../models/techMaps/step";
import { AppState } from "../../store";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { TechMapStepSeparator } from "./TechMapStepSeparator";
import { TechMapAddStep } from "./TechMapAddStep";

type Props = {
  techMapId: string;
  techMaps: TechMap[];
  ingredients: Ingredient[];
  inventory: Device[];
  requestTechMaps: Function;
  requestIngredients: Function;
  requestInventory: Function;
};

class TechMapEditor extends React.PureComponent<Props, TechMap> {
  state = this.props.techMaps.find(
    t => t.id === this.props.techMapId
  ) as TechMap;

  currentRowCounter: number = 0; //cannot use state because of constant rerenders

  setCurrentRowCount = (count: number): number => {
    this.currentRowCounter += count;
    return this.currentRowCounter;
  };

  resetCurrentRowCount = (): void => {
    this.currentRowCounter = 0;
  };

  commitStep = (step: Step) => {
    this.setState({
      ...this.state,
      steps: this.state.steps.map(s => (s.id === step.id ? step : s))
    });
  };

  removeColumn = (columnId: number) => {
    if (this.state.units.length <= 1) {
      console.warn("Cannot delete last unit");
      return;
    }

    const newUnits = this.state.units.filter((u, i) => i !== columnId);
    const newSteps = this.state.steps.map(s => {
      return {
        ...s,
        ingredients: s.ingredients.filter((ing, i) => i !== columnId),
        humanResources: s.humanResources.filter((h, i) => i !== columnId),
        inventory: s.inventory.filter((ivn, i) => i !== columnId)
      };
    });

    this.setState({
      ...this.state,
      units: newUnits,
      steps: newSteps
    });
  };

  addColumn = () => {
    const oldUnits = this.state.units;
    const newUnits = [...oldUnits];
    const oldLastUnit = newUnits[oldUnits.length - 1];
    const newLastUnit = newUnits[newUnits.length - 1] + 1;
    newUnits.push(newLastUnit);

    const newSteps = this.state.steps.map(s => {
      const ingredients = s.ingredients.map(i => {
        return {
          ...i,
          countByUnits: new Map<number, number>(i.countByUnits).set(
            newLastUnit,
            (i.countByUnits.get(oldLastUnit) as number) + 1
          )
        };
      });
      const humanResources = s.humanResources.map(i => {
        return {
          ...i,
          timeNormsByUnits: new Map<number, number>(i.timeNormsByUnits).set(
            newLastUnit,
            (i.timeNormsByUnits.get(oldLastUnit) as number) + 1
          )
        };
      });
      const inventory = s.inventory.map(i => {
        return {
          ...i,
          countByUnits: new Map<number, number>(i.countByUnits).set(
            newLastUnit,
            (i.countByUnits.get(oldLastUnit) as number) + 1
          )
        };
      });
      return {
        ...s,
        ingredients,
        humanResources,
        inventory
      };
    });
    this.setState({
      ...this.state,
      units: newUnits,
      steps: newSteps
    });
  };

  componentDidMount() {
    this.props.requestIngredients();
    this.props.requestInventory();
  }

  render() {
    this.resetCurrentRowCount();
    const techMap = this.state;

    if (!techMap) return "Tech Map not found!";

    const style = {
      gridTemplateColumns: `30px 199px repeat(${
        techMap.units.length
      }, 67px) 28px`
    };

    return (
      <div className="techMapEditorContainer">
        <div className="techMapEditor" style={style}>
          <header
            className="techMapHeader"
            style={{
              gridColumn: "2 / -1",
              gridRow: this.setCurrentRowCount(1)
            }}
          >
            <span>{techMap.name}</span>

            <button>
              <Icon size={16} color="#333" icon={ICONS.EDIT} />
            </button>
          </header>
          <div
            className="unitsRowExplanation"
            style={{
              gridColumn: "3 / -1",
              gridRow: this.setCurrentRowCount(1)
            }}
          >
            <span>Одиниць за раз</span>
          </div>
          <div
            className="unitsRowBg"
            style={{
              gridColumn: "3 / -2",
              gridRow: this.setCurrentRowCount(1)
            }}
          />
          <div className="unitsRowWrapper">
            {techMap.units.map((u, i) => (
              <div className="unitsColumnWrapper" key={i}>
                <button
                  className="techMapRoundButton1"
                  style={{
                    gridColumn: i + 3,
                    gridRow: this.setCurrentRowCount(-1)
                  }}
                  onClick={() => this.removeColumn(i)}
                >
                  <Icon icon={ICONS.MINUS} size={16} color="#ff3b30" />
                </button>

                <input
                  style={{
                    gridRow: this.setCurrentRowCount(1),
                    gridColumn: i + 3
                  }}
                  className="techMapTextCell"
                  type="number"
                  value={u}
                  key={i}
                />
              </div>
            ))}
            <button
              className="techMapRoundButton1"
              style={{ gridColumn: -2 }}
              onClick={() => this.addColumn()}
            >
              <Icon icon={ICONS.ADD} size={16} color="#007aff" />
            </button>
          </div>

          {techMap.steps.map((s, i) => (
            <React.Fragment key={i}>
              <TechMapStep
                step={s}
                units={techMap.units}
                isTop={!i}
                isBottom={techMap.steps.length === i + 1}
                ingredients={this.props.ingredients}
                inventory={this.props.inventory}
                increaseRowCount={this.setCurrentRowCount}
                commitStep={this.commitStep}
              />
              {i < techMap.steps.length - 1 ? (
                <TechMapStepSeparator
                  increaseRowCount={this.setCurrentRowCount}
                  addStep={() => {}}
                />
              ) : (
                <TechMapAddStep
                  increaseRowCount={this.setCurrentRowCount}
                  addStep={() => {}}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    techMaps: state.techMaps,
    ingredients: state.ingredients,
    inventory: state.inventory
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
  return {
    requestTechMaps: () => dispatch(thunkRequestTechMaps()),
    requestIngredients: () => dispatch(thunkRequestIngredients()),
    requestInventory: () => dispatch(thunkRequestInventory())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TechMapEditor);
