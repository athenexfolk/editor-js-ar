import { Component } from '@angular/core';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Warning from '@editorjs/warning';
import Delimiter from '@editorjs/delimiter';
import NestedList from '@editorjs/nested-list';
import InlineCode from '@editorjs/inline-code';
// import ImageTool from '@editorjs/image'
import CheckList from '@editorjs/checklist';
import Table from '@editorjs/table';
import katex from 'katex';
import MathExpression from './tool/math-expression';
import MathParagraph from './tool/paragraph-w-math';
import CodeBlock, { CodeBlockConfig } from './tool/code-block';

import { IO, IOCallback, IOType } from './models/io';
import { Subject, filter, map, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'editor-js-ar';
  editor!: EditorJS;
  output = '';

  IO$!: Subject<IO>;

  currentSentBlockId = '';

  ngOnInit() {
    let codeBlockConfig: CodeBlockConfig = {
      name: 'code-block',
      setIO: this.getIO,
    };

    katex.render('hello', document.getElementById('kt')!, {});
    this.editor = new EditorJS({
      holder: 'editorjs',
      tools: {
        header: Header,
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        quote: Quote,
        warning: Warning,
        delimiter: Delimiter,
        inlineCode: InlineCode,
        nestedList: NestedList,
        // image: ImageTool,
        checkList: CheckList,
        table: Table,
        katex: MathExpression,
        pkatex: MathParagraph,
        codeBlock: {
          class: CodeBlock as any,
          config: codeBlockConfig,
        },
      },
    });
  }

  onRes() {
    this.IO$.next({ type: IOType.OUTPUT, data: 'Output' });
  }

  click() {
    this.editor.save().then((r) => {
      this.output = JSON.stringify(r, null, 4);
    });
  }

  getIO: IOCallback = (io) => {
    this.IO$ = io;
    this.IO$.pipe(
      filter((io) => io.type == IOType.INPUT),
      map((io) => io.data)
    ).subscribe(this.onExecute);    
  };

  onExecute(data: string) {
    console.log('receive input : ', data);
  }
}
