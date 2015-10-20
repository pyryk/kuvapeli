import {Rx} from '@cycle/core';
import {h} from '@cycle/dom';

export function tabs({DOM, props$}, name = 'default') {
  let initialValue$ = props$.map(props => props.default).first();

  // TODO make tab-number independent
  let tab1$ = DOM.select('.tab1').events('click').map(() => 'tab1');
  let tab2$ = DOM.select('.tab2').events('click').map(() => 'tab2');

  let value$ = initialValue$.concat(Rx.Observable.merge(tab1$, tab2$)).do(v => console.log(v));

  let vtree$ = Rx.Observable
    .combineLatest(props$, value$, (props, value) =>
      h(`div.labeled-slider.${name}`, [
        h(`div.tab1`,
          ['Peli']
        ),
        h(`div.tab2`,
          ['Setup']
        ),
        h('div.container', value === 'tab1' ? props.children[0] : props.children[1])
      ])
    );

  return {
    DOM: vtree$,
    value$
  };
}