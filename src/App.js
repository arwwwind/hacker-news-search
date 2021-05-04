import React from 'react';
import { Input, message } from 'antd';
import debounce from './debounce';
import getRelativeTime from './relativeTime';
import { SearchOutlined } from '@ant-design/icons';
import './App.scss';
import logo from './logo.svg';

function App() {
  const [search, setSearch] = React.useState('');
  const [searchRes, setSearchRes] = React.useState([]);
  const searchElm = React.useRef(null);

  React.useEffect(() => {
    searchElm.current.focus({
      cursor: 'start',
    });
  }, []);

  const searchApi = async (string) => {
    try {
      let res = await fetch(
        `http://hn.algolia.com/api/v1/search?query=${string}&tags=story`
      );
      let { hits } = await res.json();
      res = hits
        .map(
          ({
            objectID,
            _highlightResult,
            url,
            author,
            created_at,
            num_comments,
            relevancy_score,
          }) => ({
            id: objectID,
            title: _highlightResult.title.value,
            description: _highlightResult.story_text?.value || undefined,
            url,
            author,
            created: created_at,
            commentsCount: num_comments || 0,
            score: relevancy_score || 0,
          })
        )
        .sort((a, b) => (a.score < b.score ? 1 : -1))
        .slice(0, 10);

      console.log(res);

      setSearchRes(res);
    } catch (error) {
      message.error('Problem with fetching search results');
      console.error(error);
    }
  };

  const searchFun = (str) => {
    setSearch(str);
    if (str.length > 2) {
      debounce(searchApi(str), 1000);
    }
  };

  return (
    <div className='app'>
      <header className='app-header'>
        <div className='container'>
          <img
            src='https://hn.algolia.com/packs/media/images/logo-hn-search-a822432b.png'
            alt='Hacker Search'
          />
          <h2>Hacker News Search</h2>
        </div>
      </header>
      <div className='app-body'>
        <div className='container my-4'>
          <section className='search'>
            <Input
              size='large'
              placeholder='Type something to start searching'
              prefix={<SearchOutlined />}
              value={search}
              onChange={({ target: { value } }) => searchFun(value)}
              ref={searchElm}
            />
          </section>
          {searchRes.length > 0 && (
            <section className='results'>
              {searchRes.map(
                ({
                  id,
                  author,
                  commentsCount,
                  created,
                  description,
                  title,
                  url,
                }) => (
                  <div className='result' key={id}>
                    <div className='heading'>
                      {url && (
                        <a href={url} target='_blank' rel='noreferrer'>
                          {url}
                        </a>
                      )}
                      <h5
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: title }}
                      ></h5>
                    </div>
                    <div className='meta'>
                      <span>Author: {author} |</span>
                      <span> {getRelativeTime(new Date(created))} |</span>
                      <span> {commentsCount} comments</span>
                    </div>
                    {description && (
                      <p
                        className='desc'
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: description }}
                      ></p>
                    )}
                  </div>
                )
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
