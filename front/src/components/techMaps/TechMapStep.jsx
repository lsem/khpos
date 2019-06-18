import React, { PureComponent } from "react";
import classNames from "classnames";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";
import TechMapIngredientsDataRow from "./TechMapIngredientsDataRow";
import TechMapStepSectionHeader from "./TechMapStepSectionHeader";
import TechMapHumanResourcesDataRow from "./TechMapHumanResourcesDataRow";
import TechMapInventoryDataRow from "./TechMapInventoryDataRow";
import TechMapStepInstructionsEditor from "./TechMapStepInstructionsEditor";
import "./TechMapStep.css";

export const stepTemplateRowsCount = 5;

export default class TechMapStep extends PureComponent {
  render() {
    const step = this.props.step;
    const totalRowsCount =
      step.ingredients.length +
      step.humanResources.length +
      step.inventory.length +
      stepTemplateRowsCount;
    const increaseRowCount = this.props.increaseRowCount;

    const stepFrameClasses = classNames("techMapStepFrame", {
      techMapStepFrameTop: this.props.isTop
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
            units={this.props.units}
            ingredient={i}
            row={increaseRowCount(1)}
            ingredients={this.props.ingredients}
            key={indx}
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
            units={this.props.units}
            humanResource={h}
            row={increaseRowCount(1)}
            key={indx}
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
            units={this.props.units}
            invent={i}
            row={increaseRowCount(1)}
            inventory={this.props.inventory}
            key={indx}
          />
        ))}

        <div className="techMapStepInstructionsEditorWrapper" style={{
              gridColumn: "2 / -2",
              gridRow: increaseRowCount(1)
            }}>
          <TechMapStepInstructionsEditor />
        </div>
        
        {!this.props.isBottom ?
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
}
