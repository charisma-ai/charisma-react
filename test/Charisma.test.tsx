/* eslint-disable */
import React from "react";
import { Playthrough, Conversation } from "../src";

const CharismaTest = () => {
  return (
    <Playthrough playthroughToken="test">
      <Conversation conversationId={1}>
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
