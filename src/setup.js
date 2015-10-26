import {Rx} from '@cycle/core';
import {h} from '@cycle/dom';
import styles from './app.css';
import vdCss  from './css-modules-vdom';

const h2 = vdCss(styles);

function generateAnswer(url) {
  return decodeURIComponent(url.substring(url.lastIndexOf('/')+1, url.lastIndexOf('.')));
}

export function setup({DOM, props$}) {
  let initialValue$ = props$.map(props => props.initial).first();
  let newValue$ = DOM.select(`textarea`).events('change')
    .map(ev => ev.target.value.split(/\n/))
    .map(values => values.filter(v => !!v.trim()))
    .map(values => values.map(v => ({url: v, answer: generateAnswer(v)})))
    .do((text) => console.log('textarea', text));
  let value$ = initialValue$.concat(newValue$);
  let vtree$ = Rx.Observable.combineLatest(props$, value$, (props, value) =>
    h(`div.setup`, [
      h('h2.label', [
        'Kuvat'
      ]),
      h2('textarea.images', {
        value: value.map(v => v.url).join('\n')
      })
    ])
  );

  return {
    DOM: vtree$,
    value$
  };
}