/*global QuickSettings */

const props = {
  'Size': { type: 'range', value: 50, params: [0, 100, 50, 1] },
  'Brightness': { type: 'range', value: 0, params: [-128, 128, 0, 1] },
  'Contrast': { type: 'range', value: 1, params: [0, 5.0, 1.0, 0.1] },
  'Edges': { type: 'boolean', value: 0 },
  'Diameter': { type: 'number', value: 30, params: [10, 100, 30, 0.1] },
  'Thickness': { type: 'range', value: 0.5, params: [0.1, 1.0, 0.5, 0.1] },
  'Node Amount': { type: 'range', value: 200, params: [100, 255, 200, 5] },
  'Max Lines': { type: 'range', value: 1500, params: [0, 5000, 1500, 50] },
  'Threshold': { type: 'range', value: 0, params: [0, 2000, 0, 0] },
  'Clear Width': { type: 'range', value: 3, params: [1.0, 5, 3, 0.5] },
  'Clear Alpha': { type: 'range', value: 20, params: [0, 255, 20, 5] },
  'Offset': { type: 'range', value: 10, params: [0, 100, 10, 5] },
  'Overlaps': { type: 'range', value: 0, params: [0, 15, 0, 1] },
  'Radial Granularity': { type: 'boolean', value: 0 },
  'Negative': { type: 'boolean', value: 0 },
  'Center Balance': { type: 'boolean', value: 0 },
  'Quarter': { type: 'boolean', value: 0 },

  'Control': { type: 'html', value:
   `<button class='qs_button' onclick='start()'>Start</button>&nbsp;
    <button class='qs_button' onclick='stop()'>Stop</button>&nbsp;
    <button class='qs_button' onclick='template()'>Print</button>&nbsp;
    <button class='qs_button' onclick='knit()'>Knit</button>&nbsp;
    <button class='qs_button' onclick='svg()'>SVG</button>` },
  'Status': { type: 'html', value: 'Stop' },

  'Nodes': { type: 'text', value: '' },
  'Nodes B64': { type: 'text', value: '' },
};

const defaultOptions = Object.freeze({
  width: 250,
  onUpdate: () => {},
  onFile: () => {}
});

function UI(opts = {}) {
  const options = {
    ...defaultOptions,
    ...opts,
    props: Object.fromEntries(Object.entries(props)
      .map(([name, prop]) => {
        const update = opts.props?.[name] ?? null;
        return [ name, {
          ...prop,
          ...(typeof update === 'object' ? update : { value: update })
        }];
      }
    ))
  }

  this.addFileChooser('Pick Image', '', '', options.onFile);

  const _this = this;
  Object.entries(options.props).forEach(([name, prop]) => {
    if (prop.type === 'range') {
      const params = [...prop.params];
      params[2] = prop.value;
      this.addRange(name, ...params, options.onUpdate)
    } else if (prop.type === 'boolean') {
      this.addBoolean(name, prop.value, options.onUpdate);
    } else if (prop.type === 'number') {
      const params = [...prop.params];
      params[2] = prop.value;
      this.addNumber(name, ...params, options.onUpdate);
    } else if (prop.type === 'text') {
      this.addText(name, prop.value);
    } else if (prop.type === 'html') {
      this.addHTML(name, prop.value);
    }
    Object.defineProperty(_this, name, {
      get: () => _this.getValue(name),
      set: newValue => { _this.setValue(name, newValue) }
    });
  });

  this.setWidth(options.width).setDraggable(false).setCollapsible(false);

  this.help = QuickSettings.create(options.width, 0, 'Помощь (кликни дважды)')
  .addHTML('Выбор изображения', '<div style="height:30px"></div>')
  .addHTML('Размер изображения', '<div style="height:20px"></div>')
  .addHTML('Яркость', '<div style="height:20px"></div>')
  .addHTML('Контраст', '<div style="height:20px"></div>')
  .addHTML('Диаметр холста, см', '<div style="height:20px"></div>')
  .addHTML('Толщина нитки, мм', '<div style="height:20px"></div>')
  .addHTML('Количество гвоздей', '<div style="height:20px"></div>')
  .addHTML('Максимум линий', '<div style="height:20px"></div>')
  .addHTML('Ширина очистки', '<div style="height:20px"></div>')
  .addHTML('Прозрачность очистки', '<div style="height:20px"></div>')
  .addHTML('Запрет на угол возврата', '<div style="height:20px"></div>')
  .addHTML('Максимум ниток на гвозде', '<div style="height:20px"></div>')
  .addHTML('Оптимизация чёрных полос', '')
  .addHTML('Общее улучшение', '')
  .addHTML('Приоритет линий в центре', '')
  .addHTML('Минимальное расстояние до след. гвоздя - 1/4 круга', '')
  .setWidth(200)
  .setDraggable(false)
  .collapse();
}

UI.prototype = QuickSettings.create(0, 0, 'GyverBraid v1.3');

export const useUI = opts => new UI(opts);
