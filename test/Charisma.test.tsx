import React from "react";
import { Charisma, Conversation } from "../src";

const CharismaTest = () => {
  return (
    <Charisma playthroughToken="">
      <Conversation conversationId="">
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
