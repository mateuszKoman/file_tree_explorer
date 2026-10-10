import {type ChangeEvent, type FormEvent, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {sampleTree} from '../sample.ts'
import styles from './HomePage.module.css'
import {useTreeContext} from "../state/useTreeContext.ts";

function HomePage() {
    const {index, storageWarning, loadTree, clearTree} = useTreeContext()
    const navigate = useNavigate()
    const [text, setText] = useState('')
    const [error, setError] = useState<string | null>(null)

    function load(raw: string) {
        const result = loadTree(raw)
        if (result.ok) navigate('/tree')
        else setError(result.error)
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        load(text)
    }

    async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const input = event.currentTarget
        const file = input.files?.[0]
        input.value = ''
        if (!file) return
        try {
            load(await file.text())
        } catch {
            setError(`Could not read the file "${file.name}".`)
        }
    }

    return (
        <main className={styles.page}>
            <h1>File Tree Explorer</h1>
            <p>Paste or upload a JSON tree to explore it.</p>
            {index !== null && (
                <div className={styles.banner}>
                    <p className={styles.bannerText}>A tree is loaded ({index.nodes.length} nodes)</p>
                    <button type="button" className={styles.button} onClick={() => navigate('/tree')}>
                        Open it
                    </button>
                    <button type="button" className={styles.button} onClick={clearTree}>
                        Clear
                    </button>
                    {storageWarning && (
                        <p className={styles.warning} role="status">This tree will not survive a refresh.</p>
                    )}
                </div>
            )}
            <form className={styles.form} onSubmit={handleSubmit}>
                <label htmlFor="tree-json">Tree JSON</label>
                <textarea
                    id="tree-json"
                    className={styles.textarea}
                    rows={16}
                    spellCheck={false}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    aria-invalid={error !== null}
                    aria-describedby={error !== null ? 'tree-json-error' : undefined}
                />
                {error !== null && (
                    <p id="tree-json-error" className={styles.error} role="alert">
                        {error}
                    </p>
                )}
                <div className={styles.actions}>
                    <button type="submit" className={styles.button}>
                        Load JSON
                    </button>
                    <label className={styles.file}>
                        Upload file
                        <input type="file" accept=".json" onChange={handleFileChange}/>
                    </label>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={() => load(JSON.stringify(sampleTree))}
                    >
                        Load sample
                    </button>
                </div>
            </form>
        </main>
    )
}

export default HomePage
