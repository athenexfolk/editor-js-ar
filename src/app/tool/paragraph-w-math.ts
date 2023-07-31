import {
  API,
  BlockTool,
  BlockToolConstructorOptions,
  BlockToolData,
} from '@editorjs/editorjs';
import renderMathInElement from 'katex/contrib/auto-render';

interface MathParagraphData extends BlockToolData {
  mathText: string;
}

export default class MathParagraph implements BlockTool {
  data: MathParagraphData = {
    mathText: '',
  };

  api: API;
  readOnly: boolean;

  inputTimeout = setTimeout(() => {});

  _wrapper!: HTMLDivElement;
  _display!: HTMLDivElement;
  _input!: HTMLInputElement;

  constructor({
    data,
    api,
    readOnly,
  }: BlockToolConstructorOptions<MathParagraphData>) {
    this.api = api;
    this.readOnly = readOnly;

    if (data) {
      this.data = data;
    }

    this._wrapper = this.drawView();
  }

  save() {
    this.data.mathText = this._input.value;
    return this.data;
  }

  render() {
    return this._wrapper;
  }

  drawView() {
    this._wrapper = document.createElement('div');
    this._display = document.createElement('div');

    this._wrapper.appendChild(this._display);

    this._display.classList.add(this.api.styles.block);
    this._wrapper.classList.add(this.api.styles.block);

    //Ignore create input element if it is read only mode
    if (!this.readOnly) {
      this._input = document.createElement('input');
      this._input.classList.add(this.api.styles.input);
      this._input.placeholder = 'Type some text...';
      this._input.addEventListener('input', () =>
        this._handleInputChange(this._input)
      );
      this._wrapper.appendChild(this._input);
    }

    this.insertEquation();

    return this._wrapper;
  }

  _handleInputChange(inputElement: HTMLInputElement) {
    const text = inputElement.value;
    clearTimeout(this.inputTimeout);

    this.inputTimeout = setTimeout(() => this.renderKatex(text), 500);
  }

  insertEquation() {
    let inputData =
      this.data && this.data.mathText?.length ? this.data.mathText : '';
    if (!this.readOnly) {
      this._input.value = inputData;
    }
    this.renderKatex(inputData);
  }

  renderKatex(data: string) {
    this._display.innerText = data;
    renderMathInElement(this._display, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  }

  validate(savedData: MathParagraphData) {
    if (savedData.mathText?.trim() === '') {
      return false;
    }

    return true;
  }

  static get conversionConfig() {
    return {
      export: 'mathText',
      import: 'mathText',
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  static get toolbox() {
    return {
      icon: '<p style="font-family:monospace;font-weight-bold;font-size: 16px;">MP</p>',
      title: 'Math Paragraph',
    };
  }
}
