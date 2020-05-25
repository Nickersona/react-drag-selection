import React, {
  useRef,
  useState,
  useEffect,
  useReducer,
  useContext,
} from "react";

const initialState = {
  isDragging: false,
  dragStartPosition: {
    x: null,
    y: null,
  },
  dragEndPosition: {
    x: null,
    y: null,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "dragstart":
      return {
        isDragging: true,
        dragStartPosition: {
          x: action.payload.x,
          y: action.payload.y,
        },
        dragEndPosition: {
          x: action.payload.x,
          y: action.payload.y,
        },
      };
    case "dragend":
      return {
        isDragging: false,
        dragStartPosition: {
          x: null,
          y: null,
        },
        dragEndPosition: {
          x: null,
          y: null,
        },
      };
    case "dragmove":
      const newState = {
        ...state,
        dragEndPosition: {
          x: action.payload.x,
          y: action.payload.y,
        },
      };
      return newState;
    default:
      throw new Error("No valid action provided to reducer");
  }
}

function isIntersecting(start, end, boundingRect) {
  const rightX = boundingRect.left + boundingRect.width;
  const leftX = boundingRect.left;
  const topY = boundingRect.top;
  const bottomY = boundingRect.top + boundingRect.height;

  return !(
    (start.x > rightX && end.x > rightX) ||
    (start.x < leftX && end.x < leftX) ||
    (start.y < topY && end.y < topY) ||
    (start.y > bottomY && end.y > bottomY)
  );
}

const SELECTION_MODES = {
  ADD: "ADD",
  REMOVE: "REMOVE",
};

function getSelectionMode({ ctrlKey, shiftKey }) {
  if (ctrlKey) return SELECTION_MODES.REMOVE;
  if (shiftKey) return SELECTION_MODES.ADD;
  return "default";
}

// Needed to maintain a stable reference to the move event handler to remove while not dragging
let funcRef = null;

const DragHighlight = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isDragging } = state;

  const { selectOnIntersection } = useContext(DragSelectionContext);

  useEffect(() => {
    if (isDragging) {
      function onMoveHandler(event) {
        const payload = {
          x: event.pageX,
          y: event.pageY,
        };
        dispatch({
          type: "dragmove",
          payload,
        });

        selectOnIntersection(state.dragStartPosition, payload, {
          selectionMode: getSelectionMode(event),
        });
      }

      window.addEventListener("mousemove", onMoveHandler);

      funcRef = onMoveHandler;
    } else {
      window.removeEventListener("mousemove", funcRef);
    }
  }, [isDragging]);

  // TODO Figure out why the dispatch in this handler, cancels click events deeper down the component tree
  React.useEffect(function() {
    window.addEventListener("mousedown", (event) => {
      console.log(event);
      if (event.metaKey) {
        dispatch({
          type: "dragstart",
          payload: { x: event.pageX, y: event.pageY },
        });
      }
    });

    window.addEventListener("mouseup", (event) => {
      dispatch({ type: "dragend" });
    });
  }, []);

  const { dragStartPosition: start, dragEndPosition: end } = state;

  // TODO: Because of these rigid calculations, we can only drag from top left down and right.
  // Need to handle cases where width/heights invert
  return isDragging ? (
    <div
      className="drag-highlight"
      style={{
        width: `${end.x - start.x}px`,
        height: `${end.y - start.y}px`,
        left: start.x + "px",
        top: start.y + "px",
      }}
    ></div>
  ) : null;
};

function addSelection(element, startCorner, endCorner) {
  if (element.isSelected) return;

  const hasIntersection = isIntersecting(startCorner, endCorner, element.rect);
  element.isSelected = hasIntersection;
  if (hasIntersection) element.selectionHandler();
}

function removeSelection(element, startCorner, endCorner) {
  if (!element.isSelected) return;
  const hasIntersection = isIntersecting(startCorner, endCorner, element.rect);

  element.isSelected = !hasIntersection;
  if (!hasIntersection) {
    element.selectionHandler();
  } else {
    element.deselectionHandler();
  }
}

function defaultSelection(element, startCorner, endCorner) {
  const hasIntersection = isIntersecting(startCorner, endCorner, element.rect);

  element.isSelected = hasIntersection;
  if (hasIntersection) {
    element.selectionHandler();
  } else {
    element.deselectionHandler();
  }
}

const selectionRectangleDimensions = {
  registeredEls: new Map(),
  registerSelectableElement: (element, onSelect, onDeselect) => {
    selectionRectangleDimensions.registeredEls.set(element, {
      el: element,
      rect: element.getBoundingClientRect(),
      selectionHandler: onSelect,
      deselectionHandler: onDeselect,
      isSelected: false,
    });

    return () => {
      selectionRectangleDimensions.registeredEls.delete(element);
    };
  },
  selectOnIntersection: (startCorner, endCorner, options = {}) => {
    for (let element of selectionRectangleDimensions.registeredEls.values()) {
      switch (options.selectionMode) {
        case SELECTION_MODES.ADD:
          addSelection(element, startCorner, endCorner);
          break;
        case SELECTION_MODES.REMOVE:
          removeSelection(element, startCorner, endCorner);
          break;
        default:
          defaultSelection(element, startCorner, endCorner);
      }
    }
  },
};
const DragSelectionContext = React.createContext(selectionRectangleDimensions);

export function useSelectableByDrag() {
  const { registerSelectableElement } = useContext(DragSelectionContext);
  const [isSelected, setIsSelected] = useState(false);
  const selectableRef = useRef(null);

  useEffect(() => {
    function onSelected() {
      setIsSelected(true);
    }

    function onDeselected() {
      setIsSelected(false);
    }
    let unregister = () => {};
    if (selectableRef.current) {
      unregister = registerSelectableElement(
        selectableRef.current,
        onSelected,
        onDeselected
      );
    }
    return () => {
      unregister();
    };
  }, [selectableRef.current, setIsSelected]);

  return { isSelected, selectableRef };
}

export function DragSelectionContextProvider({ children }) {
  return (
    <DragSelectionContext.Provider value={selectionRectangleDimensions}>
      {children}
      <DragHighlight />
    </DragSelectionContext.Provider>
  );
}
