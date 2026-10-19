# StudyTrack — Student Productivity App

StudyTrack is a beginner-friendly student task planner built with **HTML, CSS, and vanilla JavaScript**. It helps students organize assignments and practicals, track deadlines, and focus using a Pomodoro-style timer.

## Features

- Add, edit, complete, and delete tasks
- Organize tasks by subject and priority
- View all tasks, today's tasks, upcoming tasks, and completed tasks
- Track task completion with a progress dashboard
- See workload progress by subject
- 25-minute focus timer and 5-minute break timer
- Save tasks in browser `localStorage`, so they remain after refresh
- Responsive layout for desktop and mobile
- No framework, backend, or paid API required

## Tech stack

- **HTML5** — page structure and accessible form controls
- **CSS3** — responsive layout, cards, colors, and styling
- **JavaScript** — task operations, filtering, progress calculations, and timer
- **Browser localStorage** — local persistence

## Run the project

1. Download or clone this repository.
2. Open the `StudyTrack` folder.
3. Double-click `index.html` to open it in a modern browser.

For a smoother development experience, you can open the folder in Visual Studio Code and use the **Live Server** extension.

## Project structure

```text
StudyTrack/
├── index.html    # App layout and form
├── style.css     # Styling and responsive design
├── script.js     # App logic and local storage
└── README.md     # Project documentation
```

## How it works

1. The user enters a task, subject, priority, and due date.
2. JavaScript validates the form and adds the task to the task list.
3. Tasks are saved as JSON in the browser's local storage.
4. The dashboard recalculates completed, pending, and total tasks.
5. Filters let the user view tasks by date category or subject.
6. The focus timer switches between a 25-minute session and a 5-minute break.

## Current limitations

- Tasks are stored only in the current browser on the current device.
- There is no user account, cloud sync, or multi-device synchronization.
- The timer runs while the page is open; it is not a background notification service.

## Possible future improvements

- User login and cloud database
- Weekly calendar view
- Search and sort tasks
- Notifications for approaching deadlines
- Export tasks to CSV
- Dark mode
- Study streaks and weekly reports

## Learning outcomes

This project is a practical introduction to DOM manipulation, event listeners, arrays and objects, form handling, filtering, date handling, local storage, and responsive CSS.

## License

This project is available under the MIT License. See [LICENSE](LICENSE).
