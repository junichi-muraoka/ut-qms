## 🎯 目的 / 実装詳細 (To-Be)
情報の断片化を根絶し、「迷いのない推進」を実現。
- **Artifact Hub**: 納品物チェックリストとリンクの統合。
- **Project Wiki**: Markdown エディタによる計画書・議事録共有。

## ✅ 完了条件 (Acceptance Criteria)
- [ ] 成果物のチェックボックスが `localStorage` または D1 に永続化されること。
- [ ] **[証明必須]**：Wiki の全文検索機能で、過去の議事録が 1 秒以内にヒットすること。

## 🧪 自動検証計画 (Automated Verification)
### 1. 単体テスト (Vitest)
- **ファイル**: `server/tests/search_engine.test.ts`
- **検証**: 大量ドキュメントに対する検索パフォーマンス検証。
### 2. E2E テスト (Playwright)
- **ファイル**: `client/e2e/wiki_editor.spec.ts`
- **検証**: `page.type('.wiki-editor', '# Test Wiki')` 後のプレビュー整合性。

---
> [!CAUTION]
> **エビデンス添付ルールの徹底**
> 本タスクの完了（Close）には、実際に **Wiki で作成した計画書ページのプレビュー画面と、成果物ハブの全景のスクリーンショットのコメント添付** が必須です。
