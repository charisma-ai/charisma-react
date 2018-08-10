# Charisma for React

[Charisma.ai](https://charisma.ai) chat component for React.

```
yarn add charisma-react
```

### Usage

```jsx
<Charisma storyId={1}>
  {({ messages, onChangeInput, inputValue, start, reply }) => (
    <>
      <button onClick={() => start()}>Start</button>
      {messages.map(({ text }) => (
        <div>{text}</div>
      ))}
      <input
        onChange={({ currentTarget: { value } }) => onChangeInput(value)}
        value={inputValue}
        onKeyPress={({ key }) => {
          if (key === "Enter") {
            reply({ text: inputValue });
          }
        }}
      />
    </>
  )}
</Charisma>
```

For a full list of prop types, [see the TypeScript definition file](dist/umd/Charisma.d.ts).
