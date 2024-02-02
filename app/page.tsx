"use client"

import { useState, useEffect } from "react";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { XCircle, Loader } from 'lucide-react';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
};

type Meta = {
  status: number;
  timestamp: string;
}

type Data = {}

type Response = {
  meta: Meta
  data: Data
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoInput, setTodoInput] = useState<string>('');
  const [remainItemNum, setRemainItemNum] = useState<number>(0);
  const [isCompletingAll, setIsCompletingAll] = useState(false);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);

  const API_ENDPOINT = process.env.API_ENDPOINT

  useEffect(() => {
    fetchTodos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTodos = async () => {
    const response = await fetch(`${API_ENDPOINT}/todos`);
    const {meta, data} = await response.json();
    if (meta.status === 200) {
      const remainItemNum = data.filter((d: Todo) => !d.completed).length
      setRemainItemNum(remainItemNum);
      setTodos(data);
    }
  };

  const addTodo = async () => {
    if (todoInput.trim() !== '') {
      const response = await fetch(`${API_ENDPOINT}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: todoInput }),
      })
      const {meta, data} = await response.json();
      if (meta.status === 201) {
        toast.success('Success')
      } else {
        toast.error(data.message);
      }
      setTodoInput('');
      await fetchTodos()
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const deleteTodo = async (id: string) => {
    const response = await fetch(`${API_ENDPOINT}/todos/${id}`, {
        method: 'DELETE',
    })
    const {meta, data} = await response.json();
    if (meta.status === 200) {
      toast.success('Success')
    } else {
      toast.error(data.message);
    }
    setTodoInput('');
    await fetchTodos()
  };

  const completeTodo = async (id: string) => {
    const response = await fetch(`${API_ENDPOINT}/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: true }),
    })
    
    const {meta, data} = await response.json();
    if (meta.status === 200) {
      toast.success('Success')
    } else {
      toast.error(data.message);
    }
    await fetchTodos()
  };

  const completeAll = async () => {
    setIsCompletingAll(true)
    const response = await fetch(`${API_ENDPOINT}/todos/complete-batches`, {
      method: 'PATCH',
    })
    
    const {meta, data} = await response.json();
    if (meta.status === 200) {
      toast.success('Success')
    } else {
      toast.error(data.message);
    }

    setIsCompletingAll(false)
    await fetchTodos()
  };

  const clearCompleted = async () => {
    setIsClearingCompleted(true)
    const response = await fetch(`${API_ENDPOINT}/todos/completed`, {
      method: 'DELETE',
    })
    
    const {meta, data} = await response.json();
    if (meta.status === 200) {
      toast.success('Success')
    } else {
      toast.error(data.message);
    }
    setIsClearingCompleted(false)
    await fetchTodos()
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 main pt-40">
      <div className="flex flex-col items-center bg-gray-100 rounded-xl p-[5vw]">
        <h2 className="text-left font-bold text-3xl mb-3">TODO List</h2>
        <Input
          value={todoInput}
          onChange={(e) => setTodoInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Press Enter to add a new todo"
          className="mb-3"
          maxLength={200}
          type="text"
        />
        {todos.length === 0 ? (
          <div className="flex rounded-md border items-center justify-center h-[50vh] w-[50vw]">
            <p className="text-center italic text-gray-400 align-middle">Please add a todo item</p>
          </div>
        ) : (
          <ScrollArea className="rounded-md border p-4 h-[50vh] w-[50vw]">
            <div>
              {todos.length === 0 && (
                <p className="text-center italic text-gray-600">Please add a todo item</p>
              )}
              {todos.map((todo, index) => (
                <div 
                  className="flex space-between justify-between items-center h-16 first:pt-0 last:pb-0 border-t first:border-t-0 border-gray-200 cursor-pointer" 
                  key={todo.id}
                >
                  <div 
                    className="flex items-center"
                    onClick={() => todo.completed ? null : completeTodo(todo.id)}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      className="mr-2 br-50"
                    />
                    <div>
                    {todo.completed ? <s className="text-gray-400">{todo.title}</s> : todo.title}
                      <div className="text-xs text-gray-500">
                        {todo.completed ? 'Completed at: ' + new Date(todo.completed_at).toLocaleString(): 'Created at: ' + new Date(todo.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <XCircle cursor={'pointer'} color="red"  onClick={() => deleteTodo(todo.id)}/>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="flex justify-between mt-2.5 w-[50vw] text-gray-600">
          <div>{remainItemNum} items left</div>
          {
            isCompletingAll ? <div className="flex items-center justify-center w-[6vw]"><Loader /></div> : <div className="underline cursor-pointer w-26" onClick={() => remainItemNum > 0 ? completeAll() : null}>Complete All</div>
          }
          {
            isClearingCompleted ? <div className="flex w-[8vw] items-center justify-center"><Loader /></div> : <div className="underline cursor-pointer w-26" onClick={() => todos.length > remainItemNum ? clearCompleted() : null }>Clear Completed</div>
          }
        </div>
      </div>
      
      <ToastContainer 
        position="bottom-center"
        autoClose={1000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </main>
  );
}
