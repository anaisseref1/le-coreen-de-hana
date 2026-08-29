document.addEventListener('DOMContentLoaded',()=>{
  const page=document.querySelector('[data-mini-story]');
  if(!page)return;
  const video=page.querySelector('[data-story-video]');
  const player=page.querySelector('[data-story-player]');
  const ko=page.querySelector('[data-caption-ko]');
  const fr=page.querySelector('[data-caption-fr]');
  const progress=page.querySelector('[data-watched-progress]');
  const watchedLabel=page.querySelector('[data-watched-label]');
  const toggle=page.querySelector('[data-toggle-translation]');
  const play=page.querySelector('[data-play]');
  const cueNode=page.querySelector('[data-story-cues]');
  let cues=[];
  try{cues=JSON.parse(cueNode?.textContent||'[]')}catch(error){console.warn('Mini-story cues invalides',error)}
  const translationKey='hanaKorean_story_translationVisible';
  const showTranslation=localStorage.getItem(translationKey)!=='false';
  page.classList.toggle('hide-translation',!showTranslation);
  if(toggle)toggle.textContent=showTranslation?'🇫🇷 Masquer':'🇫🇷 Afficher';
  const updateCaption=()=>{
    if(!video)return;
    const cue=cues.find(item=>video.currentTime>=item.start&&video.currentTime<item.end);
    if(ko)ko.textContent=cue?.ko||'';
    if(fr)fr.textContent=cue?.fr||'';
    if(video.duration){
      const percent=Math.min(100,(video.currentTime/video.duration)*100);
      if(progress)progress.style.width=`${percent}%`;
      if(watchedLabel)watchedLabel.textContent=`${Math.round(percent)} %`;
    }
  };
  play?.addEventListener('click',()=>video?.paused?video.play():video?.pause());
  video?.addEventListener('play',()=>{if(play)play.textContent='⏸ Pause'});
  video?.addEventListener('pause',()=>{if(play)play.textContent='▶ Lire'});
  video?.addEventListener('timeupdate',updateCaption);
  video?.addEventListener('ended',()=>{if(play)play.textContent='↻ Revoir'});
  toggle?.addEventListener('click',()=>{
    const hidden=page.classList.toggle('hide-translation');
    localStorage.setItem(translationKey,String(!hidden));
    toggle.textContent=hidden?'🇫🇷 Afficher':'🇫🇷 Masquer';
  });
  page.querySelectorAll('[data-seek]').forEach(line=>line.addEventListener('click',()=>{
    if(!video)return;
    video.currentTime=Number(line.dataset.seek)||0;
    video.play();
    player?.scrollIntoView({behavior:'smooth',block:'center'});
  }));
  page.querySelectorAll('[data-quiz]').forEach(question=>{
    const feedback=question.querySelector('[data-feedback]');
    question.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
      question.querySelectorAll('button').forEach(choice=>choice.classList.remove('correct','wrong'));
      const correct=button.dataset.correct==='true';
      button.classList.add(correct?'correct':'wrong');
      if(!correct)question.querySelector('[data-correct="true"]')?.classList.add('correct');
      if(feedback)feedback.textContent=correct?'✅ Exact !':'💡 Regarde la réponse en vert.';
    }));
  });
  const complete=page.querySelector('[data-complete-story]');
  const storyKey=page.dataset.storyKey;
  const renderComplete=()=>{
    if(!complete||!storyKey)return;
    const done=localStorage.getItem(storyKey)==='true';
    complete.classList.toggle('is-done',done);
    complete.textContent=done?'✅ Mini-story terminée':'🌿 Marquer comme terminée';
  };
  complete?.addEventListener('click',()=>{
    if(storyKey)localStorage.setItem(storyKey,'true');
    renderComplete();
  });
  renderComplete();
  updateCaption();
});
