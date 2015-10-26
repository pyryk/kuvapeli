import {Rx} from '@cycle/core';
import {h} from '@cycle/dom';
import vc from './css-modules-vdom';
import styles from './app.css';

const h2 = vc(styles);

export function tabs({DOM, props$}, name = 'default') {
  let initialValue$ = props$.map(props => props.default).first();

  // TODO make tab-number independent
  let tab1$ = DOM.select('.tab1').events('click').map(() => 'tab1');
  let tab2$ = DOM.select('.tab2').events('click').map(() => 'tab2');

  let value$ = initialValue$.concat(Rx.Observable.merge(tab1$, tab2$)).do(v => console.log(v));

  let vtree$ = Rx.Observable
    .combineLatest(props$, value$, (props, value) =>
      h(`div.labeled-slider.${name}`, [
        h2('div.tabs', [
          h2(`div.tab1-container${value === 'tab1' ? '.active' : ''}`, [
            h(`div.tab1`,
              ['Setup']
            )
          ]),
          h2(`div.tab1-container${value === 'tab2' ? '.active' : ''}`, [
            h(`div.tab2`,
              ['Peli']
            )
          ])
          
          
        ]),
        h('div.container', value === 'tab1' ? props.children[0] : props.children[1])
      ])
    );

  return {
    DOM: vtree$,
    value$
  };
}