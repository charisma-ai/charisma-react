/* eslint-disable */
import React from "react";
import { Playthrough, Conversation } from "../src";

const CharismaTest = () => {
  return (
    <Playthrough playthroughToken="test">
      <Conversation conversationUuid="00000000-0000-0000-0000-000000000000">
        {({ inputValue, type }) => (
          <div>
            <input
              value={inputValue}
              onChange={({ currentTarget: { value } }) => type(value)}
            />
          </div>
        )}
      </Conversation>
    </Playthrough>
  );
};
