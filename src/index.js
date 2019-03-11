import React from "react";
import PropTypes from "prop-types";
import "./styles.css";

const unitMarks = {
  cm: "cm",
  in: "in"
};

const unitFactors = {
  cm: 10.0,
  in: 25.4
};

export default class MeasurementInput extends React.Component {

  static propTypes = {
    initialValue: PropTypes.number,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    unit: PropTypes.string,
    fitRange: PropTypes.string
  };

  static defaultProps = {
    unit: "cm"
  };

  constructor (props) {
    super(props);
    const value = parseFloat(props.initialValue);
    this.state = {
      error: isNaN(value),
      pending: false,
      wholeValue: this.wholeValue(value),
      fractionValue: this.fractionValue(value),
      modelValue: value
    };
  }

  wholeValue (value) {
    if (value) {
      if (this.props.unit === "cm") {
        return (value / unitFactors["cm"]).toFixed(1);
      } else {
        return Math.floor(value / unitFactors["in"]).toFixed(0);
      }
    } else {
      return "";
    }
  }

  fractionValue (value) {
    if (value && this.props.unit === "in") {
      return Math.round(8 * ((value / unitFactors["in"]) % 1)).toFixed(0);
    } else {
      return "";
    }
  }

  modelValue (whole, fraction) {
    let fixedWhole = whole.replace(",", ".");
    let value;
    if (fixedWhole === ".") {
      value = 0;
    } else if (fixedWhole.length > 0) {
      value = parseFloat(fixedWhole) * unitFactors[this.props.unit]
    } else {
      value = null;
    }

    if (value !== null && fraction) {
      value += fraction / 8;
    }

    return Math.round(value);
  }

  valueChanged = (isBlur) => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    // because isBlur could be an event
    const blur = isBlur === true;

    const wholeValue = this.wholeInput.value;
    if (!wholeValue.match(/^\d*[,.]?\d*$/)) {
      return;
    }

    const fractionValue = this.fractionInput ? this.fractionInput.value : null;
    if (fractionValue && !fractionValue.match(/^[0-7]$/)) {
      return;
    }

    const modelValue = this.modelValue(wholeValue, fractionValue);

    const newState = {
      pending: true
    };

    if (isNaN(modelValue)) {
      newState.error = true;
    } else {
      newState.error = false;
      newState.wholeValue = wholeValue;
      newState.fractionValue = fractionValue;
      newState.modelValue = modelValue;
    }

    this.setState(newState, () => {
      if (blur) {
        this.dispatchChange(true);
      } else {
        this.timeout = setTimeout(this.dispatchChange, 1000);
      }
    });
  };

  dispatchChange = (setValue) => {
    if (!this.state.error) {
      const state = {
        pending: false
      };
      if (setValue) {
        state.wholeValue = this.wholeValue(this.state.modelValue);
        state.fractionValue = this.fractionValue(this.state.modelValue);
      }
      this.setState(state, () => {
        this.props.onChange && this.props.onChange(this.state.modelValue);
      });
    }
  };

  onBlur = () => {
    this.valueChanged(true);
  };

  onFocus = () => {
    this.props.onFocus && this.props.onFocus();
  };

  onKeyDown = e => {
    if (e.keyCode === 13) {
      this.wholeInput.blur();
    }
  };

  render () {
    const classNames = ["measurement-input", "measurement-units-" + this.props.unit];
    if (this.state.error) {
      classNames.push("measurement-input-error");
    } else if (this.state.modelValue) {
      classNames.push("measurement-input-ok");
    }
    if (this.state.pending) {
      classNames.push("measurement-input-pending");
    }
    if (this.props.fitRange) {
      classNames.push(this.props.fitRange);
    }
    return (
      <div className={classNames.join(" ")}>
        <span className="units">{unitMarks[this.props.unit]}</span>
        <input type="text" value={this.state.wholeValue} onChange={this.valueChanged}
          onKeyDown={this.onKeyDown} onBlur={this.onBlur} ref={el => {this.wholeInput = el;}}
          onFocus={this.onFocus} autoComplete="off"
        />
      </div>
    );
  }
}
