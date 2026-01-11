import type { A2UIMessage } from '@elevo-cn/a2ui-react/0.8'

export interface Example {
  id: string
  title: string
  description: string
  messages: A2UIMessage[]
}

export const examples: Example[] = [
  {
    id: 'hello-world',
    title: 'Hello World',
    description: 'Basic Text component demonstration',
    messages: [
      {
        beginRendering: {
          surfaceId: 'main',
          root: 'root',
        },
      },
      {
        surfaceUpdate: {
          surfaceId: 'main',
          components: [
            {
              id: 'root',
              component: {
                Column: {
                  children: { explicitList: ['heading', 'text'] },
                },
              },
            },
            {
              id: 'heading',
              component: {
                Text: {
                  text: { literalString: 'Hello, A2UI!' },
                  usageHint: 'h1',
                },
              },
            },
            {
              id: 'text',
              component: {
                Text: {
                  text: {
                    literalString:
                      'Welcome to the A2UI Playground. Edit the JSON on the left to see changes in real-time.',
                  },
                  usageHint: 'body',
                },
              },
            },
          ],
        },
      },
    ],
  },
  {
    id: 'layout-demo',
    title: 'Layout Demo',
    description: 'Column and Row layout with multiple children',
    messages: [
      {
        beginRendering: {
          surfaceId: 'main',
          root: 'root',
        },
      },
      {
        surfaceUpdate: {
          surfaceId: 'main',
          components: [
            {
              id: 'root',
              component: {
                Column: {
                  children: { explicitList: ['header', 'content'] },
                },
              },
            },
            {
              id: 'header',
              component: {
                Text: {
                  text: { literalString: 'Layout Example' },
                  usageHint: 'h2',
                },
              },
            },
            {
              id: 'content',
              component: {
                Row: {
                  children: { explicitList: ['card1', 'card2', 'card3'] },
                },
              },
            },
            {
              id: 'card1',
              component: {
                Card: {
                  child: 'card1-text',
                },
              },
            },
            {
              id: 'card1-text',
              component: {
                Text: {
                  text: { literalString: 'Card 1' },
                  usageHint: 'body',
                },
              },
            },
            {
              id: 'card2',
              component: {
                Card: {
                  child: 'card2-text',
                },
              },
            },
            {
              id: 'card2-text',
              component: {
                Text: {
                  text: { literalString: 'Card 2' },
                  usageHint: 'body',
                },
              },
            },
            {
              id: 'card3',
              component: {
                Card: {
                  child: 'card3-text',
                },
              },
            },
            {
              id: 'card3-text',
              component: {
                Text: {
                  text: { literalString: 'Card 3' },
                  usageHint: 'body',
                },
              },
            },
          ],
        },
      },
    ],
  },
  {
    id: 'button-actions',
    title: 'Button Actions',
    description: 'Interactive Button with action handling',
    messages: [
      {
        beginRendering: {
          surfaceId: 'main',
          root: 'root',
        },
      },
      {
        surfaceUpdate: {
          surfaceId: 'main',
          components: [
            {
              id: 'root',
              component: {
                Column: {
                  children: {
                    explicitList: ['heading', 'description', 'buttons'],
                  },
                },
              },
            },
            {
              id: 'heading',
              component: {
                Text: {
                  text: { literalString: 'Button Actions' },
                  usageHint: 'h2',
                },
              },
            },
            {
              id: 'description',
              component: {
                Text: {
                  text: {
                    literalString:
                      'Click the buttons below and check the browser console to see the dispatched actions.',
                  },
                  usageHint: 'body',
                },
              },
            },
            {
              id: 'buttons',
              component: {
                Row: {
                  children: { explicitList: ['btn-primary', 'btn-secondary'] },
                },
              },
            },
            {
              id: 'btn-primary',
              component: {
                Button: {
                  child: 'btn-primary-text',
                  primary: true,
                  action: {
                    name: 'button-click',
                    context: [
                      { key: 'button', value: { literalString: 'primary' } },
                    ],
                  },
                },
              },
            },
            {
              id: 'btn-primary-text',
              component: {
                Text: {
                  text: { literalString: 'Primary' },
                },
              },
            },
            {
              id: 'btn-secondary',
              component: {
                Button: {
                  child: 'btn-secondary-text',
                  primary: false,
                  action: {
                    name: 'button-click',
                    context: [
                      { key: 'button', value: { literalString: 'secondary' } },
                    ],
                  },
                },
              },
            },
            {
              id: 'btn-secondary-text',
              component: {
                Text: {
                  text: { literalString: 'Secondary' },
                },
              },
            },
          ],
        },
      },
    ],
  },
  {
    id: 'form-inputs',
    title: 'Form Inputs',
    description: 'TextField and Checkbox components',
    messages: [
      {
        beginRendering: {
          surfaceId: 'main',
          root: 'root',
        },
      },
      {
        surfaceUpdate: {
          surfaceId: 'main',
          components: [
            {
              id: 'root',
              component: {
                Column: {
                  children: { explicitList: ['heading', 'form'] },
                },
              },
            },
            {
              id: 'heading',
              component: {
                Text: {
                  text: { literalString: 'Form Inputs' },
                  usageHint: 'h2',
                },
              },
            },
            {
              id: 'form',
              component: {
                Column: {
                  children: {
                    explicitList: ['name-field', 'email-field', 'checkbox'],
                  },
                },
              },
            },
            {
              id: 'name-field',
              component: {
                TextField: {
                  label: { literalString: 'Name' },
                  text: { path: 'form.name' },
                },
              },
            },
            {
              id: 'email-field',
              component: {
                TextField: {
                  label: { literalString: 'Email' },
                  text: { path: 'form.email' },
                },
              },
            },
            {
              id: 'checkbox',
              component: {
                CheckBox: {
                  label: { literalString: 'Subscribe to newsletter' },
                  value: { path: 'form.subscribe' },
                },
              },
            },
          ],
        },
      },
      {
        dataModelUpdate: {
          surfaceId: 'main',
          path: 'form',
          contents: [
            { key: 'name', valueString: '' },
            { key: 'email', valueString: '' },
            { key: 'subscribe', valueBoolean: false },
          ],
        },
      },
    ],
  },
  {
    id: 'data-binding',
    title: 'Data Binding',
    description: 'Components with ValueSource path bindings',
    messages: [
      {
        beginRendering: {
          surfaceId: 'main',
          root: 'root',
        },
      },
      {
        surfaceUpdate: {
          surfaceId: 'main',
          components: [
            {
              id: 'root',
              component: {
                Column: {
                  children: {
                    explicitList: ['heading', 'description', 'input', 'output'],
                  },
                },
              },
            },
            {
              id: 'heading',
              component: {
                Text: {
                  text: { literalString: 'Data Binding Demo' },
                  usageHint: 'h2',
                },
              },
            },
            {
              id: 'description',
              component: {
                Text: {
                  text: {
                    literalString:
                      'Type in the input below and see the text update in real-time.',
                  },
                  usageHint: 'body',
                },
              },
            },
            {
              id: 'input',
              component: {
                TextField: {
                  label: { literalString: 'Your message' },
                  text: { path: 'message' },
                },
              },
            },
            {
              id: 'output',
              component: {
                Card: {
                  child: 'output-content',
                },
              },
            },
            {
              id: 'output-content',
              component: {
                Column: {
                  children: { explicitList: ['output-label', 'output-text'] },
                },
              },
            },
            {
              id: 'output-label',
              component: {
                Text: {
                  text: { literalString: 'You typed:' },
                  usageHint: 'caption',
                },
              },
            },
            {
              id: 'output-text',
              component: {
                Text: {
                  text: { path: 'message' },
                  usageHint: 'body',
                },
              },
            },
          ],
        },
      },
      {
        dataModelUpdate: {
          surfaceId: 'main',
          contents: [
            { key: 'message', valueString: 'Hello from data binding!' },
          ],
        },
      },
    ],
  },
]
