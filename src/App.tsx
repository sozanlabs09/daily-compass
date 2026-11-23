
import { useEffect, useState } from "react";

type Tab =
  | "Dashboard"
  | "Tasks"
  | "Subjects"
  | "Books"
  | "Habits"
  | "Calendar"
  | "Notebook";

type Task = {
  id: number;
  title: string;
  done: boolean;
};

type Note = {
  id: number;
  title: string;
  content: string;
};

const sections: { name: Tab; icon: string }[] = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Tasks", icon: "✓" },
  { name: "Subjects", icon: "▤" },
  { name: "Books", icon: "▣" },
  { name: "Habits", icon: "✧" },
  { name: "Calendar", icon: "▦" },
  { name: "Notebook", icon: "✎" },
];

const initialTasks: Task[] = [
  { id: 1, title: "Review today's lessons", done: false },
  { id: 2, title: "Read 10 pages", done: true },
  { id: 3, title: "Organize tomorrow's schedule", done: false },
];

export default function App() {
  const [active, setActive] = useState<Tab>("Dashboard");
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dc-tasks") || "null") || initialTasks;
    } catch {
      return initialTasks;
    }
  });
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dc-notes") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    localStorage.setItem("dc-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("dc-notes", JSON.stringify(notes));
  }, [notes]);

  const completed = tasks.filter((task) => task.done).length;
  const currentNote = notes.find((note) => note.id === selectedNote);

  function addTask() {
    if (!newItem.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now(), title: newItem.trim(), done: false },
    ]);
    setNewItem("");
  }

  function addNote() {
    const note = {
      id: Date.now(),
      title: "Untitled note",
      content: "",
    };
    setNotes([...notes, note]);
    setSelectedNote(note.id);
  }

  function updateNote(id: number, changes: Partial<Note>) {
    setNotes((old) =>
      old.map((note) => (note.id === id ? { ...note, ...changes } : note))
    );
  }

  return (
    <div className="app">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f3f5f8; font-family: Arial, sans-serif; }
        button, input, textarea { font: inherit; }
        button { cursor: pointer; }
        .app { min-height: 100vh; color: #263b56; }
        .layout { display: flex; min-height: 100vh; }
        .sidebar { width: 235px; background: white; padding: 28px 17px; border-right: 1px solid #e7edf3; flex-shrink: 0; }
        .brand { font-size: 21px; font-weight: 800; color: #476c94; margin: 0 8px 8px; }
        .brand-sub { color: #94a3b8; font-size: 12px; margin: 0 8px 35px; }
        .nav-label { color: #9aa8b8; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; margin: 0 10px 12px; }
        .nav { display: flex; flex-direction: column; gap: 7px; }
        .nav button { border: 0; background: transparent; color: #718096; padding: 12px; text-align: left; border-radius: 11px; display: flex; gap: 13px; align-items: center; font-size: 14px; }
        .nav button.active, .nav button:hover { background: #eaf1f8; color: #476c94; font-weight: 700; }
        .nav-icon { width: 22px; text-align: center; font-size: 18px; }
        .main { flex: 1; min-width: 0; padding: 28px 34px; }
        .topbar { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 30px; }
        .welcome { color: #8291a3; font-size: 13px; margin-bottom: 5px; }
        h1 { font-size: 27px; margin: 0; color: #263b56; }
        .date { color: #8795a5; font-size: 13px; }
        .content { max-width: 1100px; margin: auto; }
        .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 17px; }
        .card { background: white; border: 1px solid #e8edf2; border-radius: 17px; padding: 21px; box-shadow: 0 3px 12px #263b5608; }
        .stat-label { font-size: 13px; color: #8795a5; }
        .stat-number { font-size: 29px; font-weight: 800; margin: 13px 0 5px; color: #263b56; }
        .stat-foot { color: #9aa8b8; font-size: 12px; }
        .section-title { font-size: 17px; font-weight: 750; margin: 0 0 17px; }
        .dashboard-lower { display: grid; grid-template-columns: 1.3fr 1fr; gap: 17px; margin-top: 18px; }
        .progress { height: 8px; background: #edf1f5; border-radius: 20px; overflow: hidden; margin: 16px 0 8px; }
        .progress-fill { height: 100%; background: #6d91b7; border-radius: 20px; }
        .task-row { display: flex; align-items: center; gap: 11px; padding: 12px 0; border-bottom: 1px solid #f0f2f5; font-size: 14px; }
        .task-row:last-child { border: 0; }
        .task-row input { accent-color: #476c94; width: 17px; height: 17px; }
        .done { color: #a1adba; text-decoration: line-through; }
        .primary { border: 0; border-radius: 10px; background: #476c94; color: white; padding: 11px 16px; font-weight: 650; }
        .primary:hover { background: #365779; }
        .input-row { display: flex; gap: 9px; margin-bottom: 18px; }
        .field { width: 100%; border: 1px solid #e1e8ef; border-radius: 10px; padding: 12px; outline: none; color: #263b56; background: white; }
        .field:focus { border-color: #7898bb; }
        .empty { color: #97a5b5; text-align: center; padding: 35px 10px; font-size: 14px; }
        .notes-layout { display: grid; grid-template-columns: 230px 1fr; gap: 15px; min-height: 400px; }
        .note-list { border-right: 1px solid #edf0f4; padding-right: 13px; }
        .note-item { width: 100%; border: 0; text-align: left; padding: 12px; border-radius: 9px; background: transparent; color: #52657b; margin-top: 6px; }
        .note-item.selected { background: #eaf1f8; color: #476c94; }
        .editor { display: flex; flex-direction: column; gap: 12px; }
        .editor textarea { min-height: 280px; resize: vertical; line-height: 1.7; }
        .page-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
        .muted { color: #91a0af; font-size: 13px; }
        .mobile-nav { display: none; }
        @media(max-width: 760px) {
          .layout { display: block; padding-bottom: 68px; }
          .sidebar { display: none; }
          .main { padding: 22px 16px; }
          .topbar { margin-bottom: 23px; }
          h1 { font-size: 23px; }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .card { padding: 16px; }
          .dashboard-lower { grid-template-columns: 1fr; }
          .notes-layout { grid-template-columns: 1fr; }
          .note-list { border-right: 0; border-bottom: 1px solid #edf0f4; padding: 0 0 12px; }
          .mobile-nav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; overflow-x: auto; background: white; border-top: 1px solid #e7edf3; padding: 7px 3px; z-index: 5; }
          .mobile-nav button { flex: 1; min-width: 58px; border: 0; background: transparent; color: #8392a3; font-size: 10px; padding: 5px 2px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
          .mobile-nav button.active { color: #476c94; font-weight: bold; }
          .mobile-nav span { font-size: 18px; }
          .date { display: none; }
        }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="brand">Daily Compass</div>
          <div className="brand-sub">A little direction, every day.</div>
          <div className="nav-label">WORKSPACE</div>
          <nav className="nav">
            {sections.map((section) => (
              <button
                key={section.name}
                className={active === section.name ? "active" : ""}
                onClick={() => setActive(section.name)}
              >
                <span className="nav-icon">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </nav>
        </aside>

        <main className="main">
          <div className="topbar">
            <div>
              <div className="welcome">YOUR PERSONAL SPACE</div>
              <h1>
                {active === "Dashboard" ? "Welcome back!" : active}
              </h1>
            </div>
            <div className="date">DAILY COMPASS · YOUR DAY, YOUR WAY</div>
          </div>

          <div className="content">
            {active === "Dashboard" && (
              <>
                <div className="grid">
                  <div className="card">
                    <div className="stat-label">Total tasks</div>
                    <div className="stat-number">{tasks.length}</div>
                    <div className="stat-foot">Your current to-do list</div>
                  </div>
                  <div className="card">
                    <div className="stat-label">Completed</div>
                    <div className="stat-number">{completed}</div>
                    <div className="stat-foot">Tasks you've finished</div>
                  </div>
                  <div className="card">
                    <div className="stat-label">Notebook</div>
                    <div className="stat-number">{notes.length}</div>
                    <div className="stat-foot">Saved notes</div>
                  </div>
                </div>

                <div className="dashboard-lower">
                  <div className="card">
                    <h2 className="section-title">Today's progress</h2>
                    <div className="stat-label">
                      {completed} of {tasks.length} tasks completed
                    </div>
                    <div className="progress">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${tasks.length ? (completed / tasks.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="stat-foot">Every small step counts.</div>
                  </div>
                  <div className="card">
                    <h2 className="section-title">Quick access</h2>
                    {sections.slice(1).map((section) => (
                      <button
                        key={section.name}
                        className="note-item"
                        onClick={() => setActive(section.name)}
                      >
                        {section.icon} &nbsp; {section.name} →
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {active === "Tasks" && (
              <div className="card">
                <div className="page-heading">
                  <div>
                    <h2 className="section-title">Your tasks</h2>
                    <div className="muted">Keep track of what matters.</div>
                  </div>
                </div>
                <div className="input-row">
                  <input
                    className="field"
                    placeholder="Add a new task..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                  />
                  <button className="primary" onClick={addTask}>Add</button>
                </div>
                {tasks.map((task) => (
                  <div className="task-row" key={task.id}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() =>
                        setTasks((old) =>
                          old.map((item) =>
                            item.id === task.id
                              ? { ...item, done: !item.done }
                              : item
                          )
                        )
                      }
                    />
                    <span className={task.done ? "done" : ""}>{task.title}</span>
                  </div>
                ))}
                {tasks.length === 0 && <div className="empty">No tasks yet. Add your first task!</div>}
              </div>
            )}

            {active === "Notebook" && (
              <div className="card">
                <div className="page-heading">
                  <div>
                    <h2 className="section-title">Your notebook</h2>
                    <div className="muted">Ideas, thoughts and everything worth keeping.</div>
                  </div>
                  <button className="primary" onClick={addNote}>+ New note</button>
                </div>
                <div className="notes-layout">
                  <div className="note-list">
                    {notes.map((note) => (
                      <button
                        key={note.id}
                        className={`note-item ${selectedNote === note.id ? "selected" : ""}`}
                        onClick={() => setSelectedNote(note.id)}
                      >
                        ✎ &nbsp; {note.title || "Untitled note"}
                      </button>
                    ))}
                    {notes.length === 0 && (
                      <div className="empty">Your notebook is waiting for its first note.</div>
                    )}
                  </div>
                  <div className="editor">
                    {currentNote ? (
                      <>
                        <input
                          className="field"
                          value={currentNote.title}
                          onChange={(e) =>
                            updateNote(currentNote.id, { title: e.target.value })
                          }
                          placeholder="Note title"
                        />
                        <textarea
                          className="field"
                          value={currentNote.content}
                          onChange={(e) =>
                            updateNote(currentNote.id, { content: e.target.value })
                          }
                          placeholder="Start writing..."
                        />
                        <div className="muted">Changes are saved automatically on this device.</div>
                      </>
                    ) : (
                      <div className="empty">Select a note or create a new one.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {["Subjects", "Books", "Habits", "Calendar"].includes(active) && (
              <div className="card">
                <h2 className="section-title">{active}</h2>
                <div className="empty">
                  This section is ready for its next development stage.
                  <br /><br />
                  We're building Daily Compass one section at a time.
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <nav className="mobile-nav">
        {sections.map((section) => (
          <button
            key={section.name}
            className={active === section.name ? "active" : ""}
            onClick={() => setActive(section.name)}
          >
            <span>{section.icon}</span>
            {section.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
