import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  requestTechMaps,
  requestIngredients,
  requestInventory
} from "../../actions";
import "./TechMapEditor.css";
import TechMapTextCell from "./TechMapTextCell";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";
import TechMapStep from "./TechMapStep";

class TechMapEditor extends PureComponent {
  constructor(props) {
    super(props);

    this.currentRowCount = 0;
    this.increaseRowCount = this.increaseRowCount.bind(this);
  }

  increaseRowCount(count) {
    this.currentRowCount += count;
    return this.currentRowCount;
  }

  componentDidMount() {
    this.props.requestIngredients();
    this.props.requestInventory();
  }

  render() {
    this.currentRowCount = 0;
    const techMap = this.props.techMaps.find(t => t.id === this.props.id);

    if (!techMap) return "Tech Map not found!";

    const style = {
      gridTemplateColumns: `30px 199px repeat(${
        techMap.units.length
      }, max-content) 28px`
    };

    return (
      <div className="techMapEditorContainer">
        <div className="techMapEditor" style={style}>
          <header
            className="techMapHeader"
            style={{ gridColumn: "2 / -1", gridRow: this.increaseRowCount(1) }}
          >
            {techMap.name}

            <button>
              <Icon size={16} color="#333" icon={ICONS.EDIT} />
            </button>
          </header>
          <div
            className="unitsRowExplanation"
            style={{ gridColumn: "3 / -1", gridRow: this.increaseRowCount(1) }}
          >
            <span>
              Одиниць за раз
            </span>
          </div>
          <div
            className="unitsRowBg"
            style={{ gridColumn: "3 / -2", gridRow: this.increaseRowCount(1) }}
          />
          <div className="unitsRowWrapper">
            {techMap.units.map((u, i) => (
              <div className="unitsColumnWrapper">
                <button className="techMapRoundButton1" style={{gridColumn: i + 3, gridRow: this.increaseRowCount(-1)}}>
                  <Icon icon={ICONS.MINUS} size={16} color="#ff3b30" />
                </button>
                <TechMapTextCell
                  value={u}
                  column={i + 3}
                  row={this.increaseRowCount(1)}
                  isFirst={!i}
                  key={i}
                  />
              </div>
            ))}
            <button className="techMapRoundButton1" style={{ gridColumn: -2 }}>
              <Icon icon={ICONS.ADD} size={16} color="#007aff" />
            </button>
          </div>

          {techMap.steps.map((s, i) => (
            <React.Fragment>
              <TechMapStep
                step={s}
                units={techMap.units}
                key={i}
                isTop={!i}
                isBottom={techMap.steps.length === i + 1}
                ingredients={this.props.ingredients}
                inventory={this.props.inventory}
                increaseRowCount={this.increaseRowCount}
                />
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    techMaps: state.techMaps,
    ingredients: state.ingredients,
    inventory: state.inventory
  };
};

const mapDispatchToProps = dispatch => {
  return {
    requestTechMaps: () => dispatch(requestTechMaps()),
    requestIngredients: () => dispatch(requestIngredients()),
    requestInventory: () => dispatch(requestInventory())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TechMapEditor);
