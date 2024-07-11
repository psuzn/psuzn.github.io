---
author: Sujan Poudel
pubDatetime: 2023-12-21T09:12:47.400Z
modDatetime: 2023-12-21T09:12:47.400Z
title: Building Our Own Navigation and Viewmodel Stack for Compose (1/2)
slug: building-our-own-navigation-and-viewmodel-stack
featured: true
draft: true
tags:
  - docs
description: |
  Let's build our own compose navigation stack from scratch. It won't replace your navigation library but surely will help you to 
  learn how they work under the hood.
---

This is part one of two articles. In this article, We'll build our own navigation stack and in the next part, we'll extend it to support our own lifecycle-aware view model stack.

## Table of contents

## Objective

At the end of this article, we'll build a relatively functional navigation stack. That will allow us to build our navigation graph, navigating to new destinations/popping back with custom animation.

## Components of a navigation stack

We can break down the overall functionalities of the navigation stack into 3 different components

1. **Navigation Graph**  
   Laying out the navigation by defining all the destinations with its path.

2. **Navigator / Navigation Controller**
   The part that manages the underlying navigation states, allowing users to push and pop screens.

3. **Navigation Host**  
   UI part of the navigation, responsible showing active screen also managing the transition animations between them.

## Navigation Graph

First of all we need a way to define all of our screens(i.e. navigation destinations). For this we need to store the each screen alongside it's path identifier. We can create a simple data class for this.

```kotlin

data class NavDestination(val path:  Enum<*>, val content: @Composable () -> Unit)

```

Now let's create a way for us to build own navigation graph.

```kotlin
// it acts as DSL to specify each individual screens
interface NavGraphBuilder {
    fun destination(path: PathIdentifier, content: Content)

    var startDestination: Enum<*>
}

class NavGraph(builder: NavGraphBuilder.() -> Unit) : NavGraphBuilder {
    private val destinations = HashMap<PathIdentifier, NavDestination>()
    override lateinit var startDestination: PathIdentifier


    init {
        builder.invoke(this)
        if (!this::startDestination.isInitialized) {
            throw Error("'startDestination' is required")
        }
    }

    override fun destination(path: PathIdentifier, content: Content) {
        destinations[path] = NavDestination(path, content)
    }
}

```

Here the constructor takes a builder lambda where we can register each screens with `NavGraphBuilder.destination()` function and we store them in a hashmap.

```kotlin
private val navGraph = NavGraph {
  destination(Screens.Home) {
    HomeScreen()
  }

  destination(Screens.SETTINGS) {
    SettingsScreen()
  }

}
```

This also checks if `startDestination` has been assigned or not. We need the `startDestination` to know which screen to display at first.

## The Navigator

A Navigator is also known as `NavigationController` in most of the navigation libraries. This will be responsible actually managing the what we call "navigation stack" and allowing user to push and pop screens. It sounds complicated but in reality it is not on it's basic level.

### Functionality of a Navigator.

Let's imagine what a basic navigator needs to do internally:

1. It needs to store some information about currently visible screen (**Screen A**).
2. Once user navigates to a new screen (**Screen B**). It needs to store some information about the outgoing **Screen A** and the replacing (now active) **Screen B**.
3. When user navigates back from **Screen B** to **Screen A** it needs to delete the information about **Screen B** and make the **Screen A** as active screen.

> This behavior of newly added (pushed) screen being active and removing (popping) the recently added screen when you navigate back is exactly the functionality of a [stack](<https://en.wikipedia.org/wiki/Stack_(abstract_data_type)>), so we call it a navigation stack.

We can model a screen in a navigator as a simple data class.

```kotlin
data class NavEntry(val id: Long, val destination: NavDestination)
```

> We need a extra `id` here just to distinguish between different "instance" (is it really an instance though? 🤔) of a same screen (eg. navigating to another user's **Profile Screen** when you are already on a **Profile Screen**).

We can model a simple stack with a normal list of `NavEntry` and append or remove the items as user navigate to new screen or navigates back.

```kotlin

class Navigator(private val navGraph: NavGraph) {

    private var backStack = mutableListOf<NavEntry>()

    private val _currentEntry = mutableStateOf<NavEntry?>(null)
    val currentEntry: State<NavEntry?> = _currentEntry

    val backStackCount: State<Int> = derivedStateOf { _currentEntry.value?.id ?: 0 }
    val lastNavEntryId by derivedStateOf { _currentEntry.value?.id ?: 0 }

    ...
}
```

> We'll need rest of the member properties for some other things.

#### Pushing new entry on the stack

To push a new entry we :

- Get the corresponding destination from nav graph
- Create a new entry with incremented id
- Add the new entry on `backStack` and make it the current entry

```kotlin
  fun push(path: PathIdentifier) {

      val destination = navGraph.getDestination(path)

      val entry = NavEntry(lastNavEntryId + 1, destination)
      backStack.add(entry)
      _currentEntry.value = entry
  }

```

#### Popping back the last entry

Similar to pushing when popping back the last entry we just remove the last entry from back-stack and make the new last item from back-stack as the current entry :

```kotlin
  fun pop(): Boolean {
      if (backStack.size == 1) {
          return false; // nothing to pop
      }

      backStack.removeLast()
      _currentEntry.value = backStack.last()

      return true
  }

```

## Navigation Host

This is a UI part of navigation, it observes the states from navigator and lays out the UI accordingly.

On the basic level we can just observe the current active back-stack entry and show the UI for it.

```kotlin

private val LocalNavigator = compositionLocalOf<Navigator> {
   throw Error("No Navigator found")
}

@Composable
fun NavHost(navGraph: NavGraph) {
    val savableStateHolder = rememberSaveableStateHolder()
    val navigator = remember(navGraph) { Navigator(navGraph) }
    val currentEntry by navigator.currentEntry

    CompositionLocalProvider(
        LocalNavigator provides navigator,
    ) {
        currentEntry?.also { entry ->
            entry.destination.content()
        }
    }

}

```

Now
