import React, { createContext, useContext, useReducer, useEffect } from 'react';

const BookmarkContext = createContext();

const initialState = {
  bookmarks: [],
  isLoading: false,
  error: null
};

const bookmarkReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_BOOKMARK':
      const existingBookmark = state.bookmarks.find(
        bookmark => bookmark.id === action.payload.id
      );
      if (existingBookmark) {
        return state; // Already bookmarked
      }
      return {
        ...state,
        bookmarks: [...state.bookmarks, action.payload]
      };
    
    case 'REMOVE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.filter(
          bookmark => bookmark.id !== action.payload
        )
      };
    
    case 'LOAD_BOOKMARKS':
      return {
        ...state,
        bookmarks: action.payload,
        isLoading: false
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    default:
      return state;
  }
};

export const BookmarkProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookmarkReducer, initialState);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem('webgem-bookmarks');
      if (savedBookmarks) {
        const bookmarks = JSON.parse(savedBookmarks);
        dispatch({ type: 'LOAD_BOOKMARKS', payload: bookmarks });
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load bookmarks' });
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('webgem-bookmarks', JSON.stringify(state.bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }, [state.bookmarks]);

  const addBookmark = (website) => {
    dispatch({ type: 'ADD_BOOKMARK', payload: website });
  };

  const removeBookmark = (websiteId) => {
    dispatch({ type: 'REMOVE_BOOKMARK', payload: websiteId });
  };

  const isBookmarked = (websiteId) => {
    return state.bookmarks.some(bookmark => bookmark.id === websiteId);
  };

  const bookmarkCount = state.bookmarks.length;

  const value = {
    bookmarks: state.bookmarks,
    isLoading: state.isLoading,
    error: state.error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    bookmarkCount
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}; 