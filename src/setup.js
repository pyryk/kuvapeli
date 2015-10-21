import {Rx} from '@cycle/core';
import {h} from '@cycle/dom';

export function setup({DOM, props$}) {
  let initialValue$ = props$.map(props => props.initial).first();
  let newValue$ = DOM.select(`.labeled-slider${name} .slider`).events('input')
    .map(ev => ev.target.value);
  let value$ = initialValue$.concat(newValue$);
  let vtree$ = Rx.Observable.combineLatest(props$, value$, (props, value) =>
    h(`div.labeled-slider${name}`, [
      h('span.label', [
        props.label + ' ' + value + props.unit
      ]),
      h('input.slider', {
        type: 'range',
        min: props.min,
        max: props.max,
        value: value
      })
    ])
  );

  return {
    DOM: vtree$,
    value$
  };
}