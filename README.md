# About

This is a trivial webextension that saves to disk all the JS files
encountered by the browser.

It was programmed to provide large samples of JS code for testing
purposes.

# Usage

- Clone this repository using `git clone`.
- Open Firefox.
- Open url [about:debugging](about:debugging).
- Select `Load Temporary Addon`.
- Choose any file in the directory you have created with `git clone`.
- Until you deactivate this addon, all JS source files you encounter will be downloaded to the subdirectory `scrap` of your Downloads directory.
