import _ from 'lodash';
import Device from '../../models/inventory/device';
import Icon from '../Icon';
import Ingredient from '../../models/ingredients/ingredient';
import React from 'react';
import Step from '../../models/techMaps/step';
import TechMap from '../../models/techMaps/techMap';
import uuid from 'uuid';
import { AnyAction } from 'redux';
import { AppState } from '../../store';
import { calcNeededRowsForStep, TechMapStep } from './TechMapStep';
import { connect } from 'react-redux';
import { ICONS } from '../../constants/icons';
import { TechMapAddStep } from './TechMapAddStep';
import { TechMapCell } from './TechMapCell';
import { TechMapStepSeparator } from './TechMapStepSeparator';
import { ThunkDispatch } from 'redux-thunk';
import { thunkRequestIngredients } from '../../store/ingredients/thunks';
import { thunkRequestInventory } from '../../store/inventory/thunks';
import { thunkRequestTechMaps } from '../../store/techMaps/thunks';
import './TechMapEditor.css';

type Props = {
  techMapId: string;
  techMaps: TechMap[];
  ingredients: Ingredient[];
  inventory: Device[];
  requestTechMaps: Function;
  requestIngredients: Function;
  requestInventory: Function;
  goBack: () => void;
};

type State = {
  techMap: TechMap;
  isHeaderEditing: boolean;
};

class TechMapEditor extends React.Component<Props, State> {
  state = {
    techMap: this.props.techMaps.find(
      t => t.id === this.props.techMapId
    ) as TechMap,
    isHeaderEditing: false
  };

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
      techMap: {
        ...this.state.techMap,
        steps: this.state.techMap.steps.map(s => (s.id === step.id ? step : s))
      }
    });
  };

  removeColumn = (columnId: number) => {
    if (this.state.techMap.units.length <= 1) {
      console.warn("Cannot delete last unit");
      return;
    }

    const newUnits = this.state.techMap.units.filter((u, i) => i !== columnId);
    const newSteps = this.state.techMap.steps.map(s => {
      return {
        ...s,
        ingredients: s.ingredients.filter((ing, i) => i !== columnId),
        humanResources:
          s.humanResources && s.humanResources.filter((h, i) => i !== columnId),
        inventory: s.inventory.filter((ivn, i) => i !== columnId)
      };
    });

    this.setState({
      techMap: {
        ...this.state.techMap,
        units: newUnits,
        steps: newSteps
      }
    });
  };

  addColumn = () => {
    const oldUnits = this.state.techMap.units;
    const newUnits = [...oldUnits];
    const oldLastUnit = newUnits[oldUnits.length - 1];
    const newLastUnit = newUnits[newUnits.length - 1] + 1;
    newUnits.push(newLastUnit);

    const newSteps = this.state.techMap.steps.map(s => {
      const ingredients = s.ingredients.map(i => {
        return {
          ...i,
          countByUnits: new Map<number, number>(i.countByUnits).set(
            newLastUnit,
            (i.countByUnits.get(oldLastUnit) as number) + 1
          )
        };
      });
      const humanResources =
        s.humanResources &&
        s.humanResources.map(i => {
          return {
            ...i,
            countByUnits: new Map<number, number>(i.countByUnits).set(
              newLastUnit,
              (i.countByUnits.get(oldLastUnit) as number) + 1
            )
          };
        });
      const timeNorms =
        s.timeNorms &&
        new Map<number, number>(s.timeNorms).set(
          newLastUnit,
          (s.timeNorms.get(oldLastUnit) as number) + 1
        );

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
        timeNorms,
        inventory
      };
    });
    this.setState({
      techMap: {
        ...this.state.techMap,
        units: newUnits,
        steps: newSteps
      }
    });
  };

  moveStepUp = (stepId: number) => {
    if (this.state.techMap.steps.length < 2 || stepId === 0) return;

    const newSteps = [...this.state.techMap.steps];
    const buff = newSteps[stepId];
    newSteps[stepId] = newSteps[stepId - 1];
    newSteps[stepId - 1] = buff;

    this.setState({
      techMap: {
        ...this.state.techMap,
        steps: newSteps
      }
    });
  };

  moveStepDown = (stepId: number) => {
    if (
      this.state.techMap.steps.length < 2 ||
      stepId === this.state.techMap.steps.length - 1
    )
      return;

    const newSteps = [...this.state.techMap.steps];
    const buff = newSteps[stepId];
    newSteps[stepId] = newSteps[stepId + 1];
    newSteps[stepId + 1] = buff;

    this.setState({
      techMap: {
        ...this.state.techMap,
        steps: newSteps
      }
    });
  };

  removeStep = (stepId: number) => {
    const newSteps = this.state.techMap.steps.filter((s, i) => i !== stepId);
    this.setState({
      techMap: {
        ...this.state.techMap,
        steps: newSteps
      }
    });
  };

  duplicateStep = (stepId: number) => {
    const newStep = _.cloneDeep(this.state.techMap.steps[stepId]);
    newStep.id = `STP-${uuid.v4()}`;

    const newSteps = [...this.state.techMap.steps];
    newSteps.splice(stepId + 1, 0, newStep as Step);

    this.setState({
      techMap: {
        ...this.state.techMap,
        steps: newSteps
      }
    });
  };

  addNewStepAt = (stepId: number) => {
    const newStep = {
      id: `STP-${uuid.v4()}`,
      name: "Новий крок",
      ingredients: [],
      inventory: [],
      instructions: ""
    } as Step;

    const newSteps = [...this.state.techMap.steps];
    newSteps.splice(stepId + 1, 0, newStep as Step);

    this.setState({
      techMap: {
        ...this.state.techMap,
        steps: newSteps
      }
    });
  };

  beginHeaderEditing = () => {
    this.setState({
      isHeaderEditing: true
    });
  };

  endHeaderEditing = (newTechMapName: string) => {
    this.setState({
      techMap: { ...this.state.techMap, name: newTechMapName },
      isHeaderEditing: false
    });
  };

  commitUnitCell = (columnId: number, value: number) => {
    if (this.state.techMap.units[columnId] === value) return;

    const techMap = this.state.techMap;
    const oldValue = techMap.units[columnId];

    if (this.state.techMap.units.includes(value)) {
      console.warn("Units already has unit: " + value + " edit canceled."); //TODO: notify user

      this.setState({
        techMap: {
          ...techMap,
          units: techMap.units.map((u, i) => (i === columnId ? oldValue : u))
        }
      });
      return;
    }

    const newSteps = techMap.steps.map(s => {
      const ingredients = s.ingredients.map(i => {
        const val = i.countByUnits.get(oldValue) as number;
        const newCountByUnits = new Map(i.countByUnits);
        newCountByUnits.delete(oldValue);
        newCountByUnits.set(value, val);
        return { ...i, countByUnits: newCountByUnits };
      });

      const humanResources =
        s.humanResources &&
        s.humanResources.map(h => {
          const val = h.countByUnits.get(oldValue) as number;
          const newCountByUnits = new Map(h.countByUnits);
          newCountByUnits.delete(oldValue);
          newCountByUnits.set(value, val);
          return { ...h, countByUnits: newCountByUnits };
        });

      let timeNorms;
      if (s.timeNorms) {
        timeNorms = new Map<number, number>(s.timeNorms);
        timeNorms.delete(oldValue);
        timeNorms.set(value, s.timeNorms.get(oldValue) as number);
      }

      const inventory = s.inventory.map(i => {
        const val = i.countByUnits.get(oldValue) as number;
        const newCountByUnits = new Map(i.countByUnits);
        newCountByUnits.delete(oldValue);
        newCountByUnits.set(value, val);
        return { ...i, countByUnits: newCountByUnits };
      });

      return {
        ...s,
        ingredients,
        humanResources,
        timeNorms,
        inventory
      };
    });

    this.setState({
      techMap: {
        ...techMap,
        units: techMap.units.map((u, i) => (i === columnId ? value : u)),
        steps: newSteps
      }
    });
  };

  componentDidMount() {
    this.props.requestIngredients();
    this.props.requestInventory();
  }

  render() {
    this.resetCurrentRowCount();
    const techMap = this.state.techMap;

    if (!techMap) return "Tech Map not found!";

    const lastStepId = techMap.steps.length - 1;

    const style = {
      gridTemplateColumns: `30px 199px repeat(${techMap.units.length}, 67px) 28px`
    };

    return (
      <div className="techMapEditorContainer">
        <div className="techMapEditor" style={style}>
          <nav
            className="techMapNavBar"
            style={{
              gridColumn: "2 / -1",
              gridRow: this.setCurrentRowCount(1)
            }}
          >
            <button
              className="techMapEditorBackButton"
              onClick={this.props.goBack}
            >
              <Icon size={12} color="#007AFF" icon={ICONS.BACK} />
              <span>Назад</span>
            </button>
          </nav>
          <header
            className="techMapHeader"
            style={{
              gridColumn: "2 / -1",
              gridRow: this.setCurrentRowCount(1)
            }}
          >
            {this.state.isHeaderEditing ? (
              <input
                type="text"
                autoFocus
                onBlur={e => this.endHeaderEditing(e.target.value)}
                defaultValue={this.state.techMap.name}
                onFocus={e => e.target.select()}
              />
            ) : (
              <span>{techMap.name}</span>
            )}

            <button onClick={() => this.beginHeaderEditing()}>
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

                <TechMapCell
                  row={this.setCurrentRowCount(1)}
                  column={i + 3}
                  inputType="number"
                  initialValue={"" + u}
                  onBlur={e => this.commitUnitCell(i, +e.target.value)}
                  key={i}
                />
              </div>
            ))}
            <button
              className="techMapRoundButton1"
              style={{ gridColumn: -2, gridRow: this.setCurrentRowCount(0) }}
              onClick={() => this.addColumn()}
            >
              <Icon icon={ICONS.ADD} size={16} color="#007aff" />
            </button>
          </div>

          {techMap.steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <TechMapStep
                step={s}
                units={techMap.units}
                isTop={!i}
                isBottom={techMap.steps.length === i + 1}
                ingredients={this.props.ingredients}
                inventory={this.props.inventory}
                startRow={this.setCurrentRowCount(0)}
                commitStep={this.commitStep}
                moveStepUp={() => this.moveStepUp(i)}
                moveStepDown={() => this.moveStepDown(i)}
                removeStep={() => this.removeStep(i)}
                duplicateStep={() => this.duplicateStep(i)}
              />
              {i < techMap.steps.length - 1 && (
                <TechMapStepSeparator
                  startRow={this.setCurrentRowCount(
                    calcNeededRowsForStep(s) + 1
                  )}
                  addStep={() => {
                    this.addNewStepAt(i);
                  }}
                />
              )}
            </React.Fragment>
          ))}
          <TechMapAddStep
            addStep={() => {
              this.addNewStepAt(lastStepId);
            }}
          />
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
