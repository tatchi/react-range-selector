import React from "react";
const { Provider, Consumer } = React.createContext();

class RangeSelector extends React.Component {
  select = indexe => {
    this.setState(({ selectedIndexes: prevSelectedIndexes }) => {
      let newSelectedIndexes = [...prevSelectedIndexes];
      const inAlreadyExistingIndex = prevSelectedIndexes.findIndex(
        ([start, end]) => {
          return indexe >= start && indexe <= end;
        }
      );

      if (inAlreadyExistingIndex > -1) {
        newSelectedIndexes = newSelectedIndexes.filter(
          (v, i) => i !== inAlreadyExistingIndex
        );
      }
      const currentDraftIndexe = newSelectedIndexes.findIndex(
        ([start, end]) => start > -1 && !end
      );
      // Add end to a existing one
      if (currentDraftIndexe > -1) {
        const [start] = newSelectedIndexes[currentDraftIndexe];

        // If we click again on the same
        if (indexe === start) {
          return {
            selectedIndexes: [
              ...newSelectedIndexes.filter((val, i) => i !== currentDraftIndexe)
            ]
          };
        }

        const [startToSave, endToSave] =
          indexe >= start ? [start, indexe] : [indexe, start];

        return {
          selectedIndexes: [
            ...newSelectedIndexes.filter(
              ([s, e], i) =>
                i !== currentDraftIndexe &&
                // !(s >= startToSave && e <= endToSave),
                (startToSave > s || endToSave < e)
            ),
            [startToSave, endToSave]
          ].reduce((acc, [s, e]) => {
            const contigu = acc.find(
              ([start, end]) =>
                Math.abs(s - end) === 1 || Math.abs(e - start) === 1
            );

            if (!contigu) {
              return [...acc, [s, e]];
            }

            const res = [
              ...acc,
              [Math.min(s, contigu[0]), Math.max(e, contigu[1])]
            ];
            const filtered = res.filter(
              a => !(a[0] === contigu[0] && a[1] === contigu[1])
            );

            return filtered;
          }, [])
        };
      }

      return {
        selectedIndexes: [...newSelectedIndexes, [indexe, ""]]
      };
    });
  };

  isSelected = indexe => {
    return this.state.selectedIndexes.some(([start, end]) => {
      if (!end) {
        return indexe === start;
      }
      return indexe >= start && indexe <= end;
    });
  };

  state = {
    selectedIndexes: [[]],
    select: this.select,
    isSelected: this.isSelected
  };

  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

const RangeSelectorItem = props => {
  const { index, children } = props;
  return (
    <Consumer>
      {({ select, isSelected }) =>
        children({
          select: () => select(index),
          isSelected: () => isSelected(index)
        })
      }
    </Consumer>
  );
};

export { RangeSelector, RangeSelectorItem };
