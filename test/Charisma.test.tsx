/* eslint-disable */
import React from "react";
import { Charisma, Conversation } from "../src";

const CharismaTest = () => {
  return (
    <Charisma playthroughToken="test">
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
    </Charisma>
  );
};
