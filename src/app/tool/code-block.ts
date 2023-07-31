import {
  API,
  BlockAPI,
  BlockTool,
  BlockToolConstructorOptions,
  BlockToolData,
} from '@editorjs/editorjs';

import loader from '@monaco-editor/loader';
import * as editor from 'monaco-editor/esm/vs/editor/editor.api';
import { IO, IOCallback, IOType } from '../models/io';
import { Subject, filter, map, tap } from 'rxjs';

import { Language, availableLanguages } from './available-language';

interface CodeBlockData extends BlockToolData {
  language: string;
  code: string;
}

export interface CodeBlockConfig {
  name: string;
  setIO: IOCallback;
}

export default class CodeBlock implements BlockTool {
  api: API;
  readOnly: boolean;
  config?: CodeBlockConfig;
  block: BlockAPI;
  data: CodeBlockData = {
    language: '',
    code: '',
  };

  IO$ = new Subject<IO>();

  _wrapper!: HTMLDivElement;
  _option!: HTMLDivElement;
  _editor!: HTMLDivElement;
  _output!: HTMLDivElement;

  _configWrapper!: HTMLDivElement;
  _filenameInput!: HTMLInputElement;
  _languageSelector!: HTMLSelectElement;
  _runButton!: HTMLButtonElement;

  ieditor!: typeof editor.editor;
  monacoEditor!: editor.editor.IStandaloneCodeEditor;

  constructor({
    api,
    readOnly,
    data,
    config,
    block,
  }: BlockToolConstructorOptions<CodeBlockData, CodeBlockConfig>) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config;
    this.block = block!;
    if (data) this.data = data;

    this._wrapper = this.drawView();
  }

  save() {}

  render() {
    return this._wrapper;
  }

  destroy() {
    this.unsubscribeIO();
  }

  private loadEditor() {
    loader.init().then((monaco) => {
      this.ieditor = monaco.editor;
      this.monacoEditor = this.ieditor.create(this._editor, {
        value: '',
        language: 'c',
      });

      //   this._languageSelector.onchange = () => {
      //     monaco.editor
      //     console.log('change');

      //     this.data.language = this._languageSelector.value;
      //     monaco.editor.setModelLanguage(
      //       this.monacoEditor.getModel(),
      //       this._languageSelector.value
      //     );
      //   };
    });
  }

  private subscribeIO() {
    this.IO$.pipe(
      filter((io) => io.type == IOType.OUTPUT),
      map((io) => io.data)
    ).subscribe(this.onReceiveOutput);
  }

  private unsubscribeIO() {
    this.IO$.complete();
  }

  private onReceiveOutput = (data: string) => {
    let div = document.createElement('div');
    div.textContent = data;
    this._output.insertBefore(div, this._output.lastChild);
  };

  private sendToExternal(code: string) {
    console.log('sent');

    this.IO$.next({
      type: IOType.INPUT,
      data: code,
    });
  }

  // Struct element node: start ---> //
  private drawView() {
    this._wrapper = document.createElement('div');
    this._option = document.createElement('div');
    this._editor = document.createElement('div');
    this._output = document.createElement('div');

    this._wrapper.appendChild(this._option);
    this._wrapper.appendChild(this._editor);
    this._wrapper.appendChild(this._output);

    this._option.classList.add(this.api.styles.block, 'option-wrapper');
    this._editor.classList.add(this.api.styles.block);
    this._output.classList.add(this.api.styles.block, 'output-wrapper');
    this._wrapper.classList.add(this.api.styles.block, 'code-wrapper');

    this._output.style.display = 'none';

    this._editor.style.height = '200px';

    this.loadEditor();

    this.structOption();
    this.structOutput();

    return this._wrapper;
  }

  private structOption() {
    this.structFilenameInput();
    this.structLanguageSelector(availableLanguages);
    this.structRunButton();
    this.structConfigWrapper();

    this._option.appendChild(this._configWrapper);
    this._option.appendChild(this._runButton);
  }

  private structConfigWrapper() {
    this._configWrapper = document.createElement('div');
    this._configWrapper.classList.add('config-wrapper');

    this._configWrapper.appendChild(this._filenameInput);
    this._configWrapper.appendChild(this._languageSelector);
  }

  private structFilenameInput() {
    // const filenamePattern = /^[a-zA-Z0-9_-]+$/;
    this._filenameInput = document.createElement('input');
    this._filenameInput.type = 'text';
    this._filenameInput.placeholder = 'Enter file name';
  }

  private structLanguageSelector(lang: Language[]) {
    this._languageSelector = document.createElement('select');

    lang.forEach((l) => {
      let option = document.createElement('option');
      option.text = l.name;
      option.value = l.id;
      this._languageSelector.appendChild(option);
    });
    this._languageSelector.onchange = () => {
      console.log('change');

      this.data.language = this._languageSelector.value;

      this.ieditor.setModelLanguage(
        this.monacoEditor.getModel()!,
        this._languageSelector.value
      );
    };
  }

  private structRunButton() {
    this._runButton = document.createElement('button');
    this._runButton.classList.add('run-button');
    this._runButton.textContent = 'Run';

    this._runButton.addEventListener('click', () => {
      this.runCode();
    });
  }

  private structOutput() {
    let input = document.createElement('input');
    input.type = 'text';
    this._output.appendChild(input);

    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        let div = document.createElement('div');
        div.textContent = input.value;
        this._output.insertBefore(div, this._output.lastChild);
        input.value = '';
      }
    });
  }

  // Struct element node: end <-- //

  private runCode() {
    this._output.style.display = 'block';

    this.unsubscribeIO();
    this.IO$ = new Subject<IO>();
    this.config?.setIO(this.IO$);

    this.subscribeIO();
    let code = this.monacoEditor.getValue();
    // console.log(code);
    this.sendToExternal(code);
  }

  private insertLanguage() {
    // this.o
  }

  static get enableLineBreaks() {
    return true;
  }

  static get toolbox() {
    return {
      icon: '<p style="font-family:monospace;font-weight-bold;font-size: 16px;">C</p>',
      title: 'Code Block',
    };
  }
}
