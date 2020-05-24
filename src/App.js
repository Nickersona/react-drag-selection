import React from "react";
import "./App.css";
import { useSelectableByDrag, DragSelectionContextProvider } from "./lib";

function Pipeline({ children }) {
  return <div className="pipeline">{children}</div>;
}
Pipeline = React.memo(Pipeline);

const Card = ({ children }) => {
  const { isSelected, selectableRef } = useSelectableByDrag();
  let className = "card";
  className += isSelected ? " card--selected" : "";
  return (
    <div ref={selectableRef} className={className}>
      {children}
    </div>
  );
};

function App() {
  return (
    <DragSelectionContextProvider>
      <div className="board">
        <Pipeline>
          <Card>
            <header>
              <h3>Item 1</h3>
            </header>
            <main>
              <p>Details about 1</p>
            </main>
          </Card>
          <Card>
            <header>
              <h3>Item 2</h3>
            </header>
            <main>
              <p>Details about 2</p>
            </main>
          </Card>
          <Card>
            <header>
              <h3>Item 3</h3>
            </header>
            <main>
              <p>Details about 3</p>
            </main>
          </Card>
        </Pipeline>
        <Pipeline>
          <Card>
            <header>
              <h3>Item 4</h3>
            </header>
            <main>
              <p>Details about 4</p>
            </main>
          </Card>
          <Card>
            <header>
              <h3>Item 5</h3>
            </header>
            <main>
              <p>Details about 5</p>
            </main>
          </Card>
          <Card>
            <header>
              <h3>Item 6</h3>
            </header>
            <main>
              <p>Details about 6</p>
            </main>
          </Card>
        </Pipeline>
        <Pipeline>
          <Card>
            <header>
              <h3>Item 7</h3>
            </header>
            <main>
              <p>Details about 7</p>
            </main>
          </Card>
          <Card>
            <header>
              <h3>Item 8</h3>
            </header>
            <main>
              <p>Details about 8</p>
            </main>
          </Card>
          <Card>
            <header>
              <h3>Item 9</h3>
            </header>
            <main>
              <p>Details about 9</p>
            </main>
          </Card>
          <Card>
            <header>
              <h3>Item 10</h3>
            </header>
            <main>
              <p>Details about 10</p>
            </main>
          </Card>
        </Pipeline>
      </div>
    </DragSelectionContextProvider>
  );
}

export default App;
