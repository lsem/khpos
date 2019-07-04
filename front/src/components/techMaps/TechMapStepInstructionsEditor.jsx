import React from "react";
import { Editor, EditorState, ContentState, RichUtils } from "draft-js";
import { convertToHTML, convertFromHTML } from 'draft-convert';
import "./TechMapStepInstructionsEditor.css";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

export default class TechMapStepInstructionsEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty()
    };

    this.handleBlur = this.handleBlur.bind(this);

    this.focus = () => this.refs.editor.focus();
    this.onChange = editorState => {
      this.setState({ editorState });
    };

    this.handleKeyCommand = command => this._handleKeyCommand(command);
    this.onTab = e => this._onTab(e);
    this.toggleBlockType = type => this._toggleBlockType(type);
    this.toggleInlineStyle = style => this._toggleInlineStyle(style);
  }

  handleBlur() {
    this.props.editInstructions(convertToHTML(this.state.editorState.getCurrentContent()));
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  }

  importHTML = () => {
    const { editorState } = this.state;
    this.onChange(EditorState.push(editorState, convertFromHTML(this.props.instructions)));
  }
  
  exportHTML = () => {
    this.setState({ convertedContent: convertToHTML(this.state.editorState.getCurrentContent()) });
  }

  componentDidMount() {
    this.importHTML();
  }

  render() {
    const { editorState } = this.state;
    const styleMap = {
      STRIKETHROUGH: {
        textDecoration: "line-through"
      }
    };

    return (
      <div className="RichEditor-root">
        <div className="RichEditor-controls">
          <button
            className="RichEditor-styleButton"
            onClick={() => this.toggleBlockType("ordered-list-item")}
          >
            <Icon
              icon={ICONS.ORDERED_LIST}
              size={16}
              originalSize={24}
              color="#333"
            />
          </button>
        </div>
        <div className="RichEditor-editor" onClick={this.focus}>
          <Editor
            // blockStyleFn={getBlockStyle}
            // customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            onTab={this.onTab}
            placeholder=""
            ref="editor"
            spellCheck={false}
            onBlur={this.handleBlur}
          />
        </div>
      </div>
    );
  }
}

const BLOCK_TYPES = [
  { label: "H1", style: "header-one" },
  { label: "H2", style: "header-two" },
  { label: "H3", style: "header-three" },
  { label: "H4", style: "header-four" },
  { label: "H5", style: "header-five" },
  { label: "H6", style: "header-six" },
  { label: "Blockquote", style: "blockquote" },
  { label: "UL", style: "unordered-list-item" },
  { label: "OL", style: "ordered-list-item" },
  { label: "Code Block", style: "code-block" }
];

var INLINE_STYLES = [
  { label: "Bold", style: "BOLD" },
  { label: "Italic", style: "ITALIC" },
  { label: "Underline", style: "UNDERLINE" },
  { label: "Monospace", style: "CODE" }
];
