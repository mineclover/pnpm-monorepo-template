import { beforeEach, describe, expect, it } from 'vitest'

/**
 * Vitest 브라우저 모드 테스트 예제
 * - 실제 브라우저 환경에서 DOM 테스트
 * - Playwright를 프로바이더로 사용
 */

describe('DOM Manipulation Tests', () => {
  beforeEach(async () => {
    // 각 테스트 전에 DOM 초기화
    document.body.innerHTML = ''
  })

  it('should create and append elements', async () => {
    const div = document.createElement('div')
    div.id = 'test-div'
    div.textContent = 'Hello, World!'
    document.body.appendChild(div)

    const element = document.getElementById('test-div')
    expect(element).toBeTruthy()
    expect(element?.textContent).toBe('Hello, World!')
  })

  it('should handle click events', async () => {
    const button = document.createElement('button')
    button.id = 'test-button'
    button.textContent = 'Click me'

    let clicked = false
    button.addEventListener('click', () => {
      clicked = true
    })

    document.body.appendChild(button)

    const element = document.getElementById('test-button') as HTMLButtonElement
    element.click()

    expect(clicked).toBe(true)
  })

  it('should manipulate CSS classes', async () => {
    const div = document.createElement('div')
    div.classList.add('initial-class')
    document.body.appendChild(div)

    expect(div.classList.contains('initial-class')).toBe(true)

    div.classList.remove('initial-class')
    div.classList.add('new-class', 'another-class')

    expect(div.classList.contains('initial-class')).toBe(false)
    expect(div.classList.contains('new-class')).toBe(true)
    expect(div.classList.contains('another-class')).toBe(true)
  })
})

describe('Form Validation Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="test-form">
        <input type="email" id="email" required />
        <input type="password" id="password" required minlength="8" />
        <button type="submit">Submit</button>
      </form>
    `
  })

  it('should validate email input', () => {
    const emailInput = document.getElementById('email') as HTMLInputElement

    emailInput.value = 'invalid-email'
    expect(emailInput.validity.valid).toBe(false)

    emailInput.value = 'valid@example.com'
    expect(emailInput.validity.valid).toBe(true)
  })

  it('should validate password length', () => {
    const passwordInput = document.getElementById('password') as HTMLInputElement

    passwordInput.value = 'short'
    expect(passwordInput.validity.valid).toBe(false)
    expect(passwordInput.validity.tooShort).toBe(true)

    passwordInput.value = 'long-enough-password'
    expect(passwordInput.validity.valid).toBe(true)
  })

  it('should prevent form submission on invalid input', () => {
    const form = document.getElementById('test-form') as HTMLFormElement
    const emailInput = document.getElementById('email') as HTMLInputElement

    let submitted = false
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      submitted = true
    })

    // 빈 입력으로 제출 시도
    form.requestSubmit()
    expect(submitted).toBe(false)

    // 유효한 입력으로 제출
    emailInput.value = 'valid@example.com'
    const passwordInput = document.getElementById('password') as HTMLInputElement
    passwordInput.value = 'valid-password'

    form.requestSubmit()
    expect(submitted).toBe(true)
  })
})

describe('Local Storage Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store and retrieve data', () => {
    localStorage.setItem('key', 'value')
    expect(localStorage.getItem('key')).toBe('value')
  })

  it('should handle JSON data', () => {
    const data = { name: 'Test', value: 123 }
    localStorage.setItem('json-data', JSON.stringify(data))

    const retrieved = JSON.parse(localStorage.getItem('json-data') || '{}')
    expect(retrieved).toEqual(data)
  })

  it('should remove items', () => {
    localStorage.setItem('temp', 'value')
    expect(localStorage.getItem('temp')).toBe('value')

    localStorage.removeItem('temp')
    expect(localStorage.getItem('temp')).toBeNull()
  })
})

describe('Fetch API Tests', () => {
  it('should make GET request', async () => {
    // Mock API 응답
    const mockResponse = { data: 'test' }

    global.fetch = async () => {
      return {
        ok: true,
        json: async () => mockResponse,
      } as Response
    }

    const response = await fetch('/api/data')
    const data = await response.json()

    expect(data).toEqual(mockResponse)
  })

  it('should handle POST request', async () => {
    const postData = { name: 'Test' }

    global.fetch = async (_url, options) => {
      const body = JSON.parse(options?.body as string)
      expect(body).toEqual(postData)

      return {
        ok: true,
        json: async () => ({ success: true }),
      } as Response
    }

    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    })

    const result = await response.json()
    expect(result.success).toBe(true)
  })
})

describe('Async Operations Tests', () => {
  it('should handle promises', async () => {
    const promise = Promise.resolve('resolved value')
    const result = await promise
    expect(result).toBe('resolved value')
  })

  it('should handle timeouts', async () => {
    let executed = false

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        executed = true
        resolve()
      }, 100)
    })

    expect(executed).toBe(true)
  })
})
