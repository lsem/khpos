import React from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  RawDraftContentState
} from "draft-js";
import "./TechMapStepInstructionsEditor.css";
import Icon from "../Icon";
import { ICONS } from "../../constants/icons";

type State = {
  editorState: EditorState;
};

type Props = {
  instructions: string;
  editInstructions: Function;
};

export class TechMapStepInstructionsEditor extends React.Component<
  Props,
  State
> {
  state = {
    editorState: EditorState.createEmpty()
  };

  onChange = (editorState: EditorState) => {
    this.setState({ editorState });
  };

  handleBlur = () => {
    this.props.editInstructions(
      JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))
    );
  };

  handleKeyCommand = (
    command: string,
    editorState: EditorState  ) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return "handled";
    }
    return "not-handled";
  };

  onTab = (e: React.KeyboardEvent<{}>) => {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  };

  toggleBlockType = (blockType: string) => {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  };

  toggleInlineStyle = (inlineStyle: string) => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  };

  componentDidMount() {
    if (!this.props.instructions) {
      this.onChange(EditorState.createEmpty());
      return;
    }

    const contentState = convertFromRaw(JSON.parse(
      this.props.instructions
    ) as RawDraftContentState);
    this.onChange(EditorState.createWithContent(contentState));
  }

  render() {
    const { editorState } = this.state;

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
        <div className="RichEditor-editor">
          <Editor
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
